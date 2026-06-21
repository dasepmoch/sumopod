import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { OrderStatus, Prisma, VpsStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import {
    ProvisionVpsFromOrderDto,
    UpdateVpsInstanceDto,
    UpdateVpsStatusDto,
} from './dto/vps-instance.dto'

// Allowed VPS status transitions (admin driven).
const STATUS_TRANSITIONS: Record<VpsStatus, VpsStatus[]> = {
    [VpsStatus.provisioning]: [VpsStatus.active],
    [VpsStatus.active]: [VpsStatus.suspended, VpsStatus.expired],
    [VpsStatus.suspended]: [VpsStatus.active],
    [VpsStatus.expired]: [VpsStatus.terminated],
    [VpsStatus.terminated]: [],
}

@Injectable()
export class VpsInstancesService {
    constructor(private prisma: PrismaService) {}

    // ---- User ----
    findMy(userId: number) {
        return this.prisma.vpsInstance.findMany({
            where: { userId },
            orderBy: { id: 'desc' },
        })
    }

    async findOne(userId: number, role: string, id: number) {
        const vps = await this.prisma.vpsInstance.findUnique({ where: { id } })
        if (!vps) {
            throw new NotFoundException('VPS not found')
        }
        if (role !== 'ADMIN' && vps.userId !== userId) {
            throw new ForbiddenException('Not your VPS')
        }
        return vps
    }

    // ---- Admin ----
    findAllAdmin() {
        return this.prisma.vpsInstance.findMany({
            orderBy: { id: 'desc' },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        })
    }

    async createFromOrder(orderId: number, dto: ProvisionVpsFromOrderDto) {
        if (orderId < 1) {
            throw new BadRequestException('orderId must be a positive integer')
        }

        try {
            return await this.prisma.$transaction(async (transaction) => {
                const order = await transaction.order.findUnique({
                    where: { id: orderId },
                    include: { product: true },
                })
                if (!order) {
                    throw new NotFoundException('Order not found')
                }

                const existing = await transaction.vpsInstance.findUnique({
                    where: { orderId },
                })
                if (existing) {
                    throw new ConflictException(
                        'A VPS instance already exists for this order',
                    )
                }
                if (order.status !== OrderStatus.paid) {
                    throw new BadRequestException(
                        `Only paid orders can be provisioned (current: ${order.status})`,
                    )
                }
                if (dto.hostname !== order.vpsName) {
                    throw new BadRequestException(
                        'Hostname must match the paid order',
                    )
                }
                if (order.selectedOs && dto.os !== order.selectedOs) {
                    throw new BadRequestException(
                        'Operating system must match the paid order',
                    )
                }

                const product = order.product
                const vps = await transaction.vpsInstance.create({
                    data: {
                        userId: order.userId,
                        orderId: order.id,
                        productId: product.id,
                        providerAccountId: product.providerAccountId,
                        vpsName: dto.hostname,
                        provider: product.provider,
                        region: product.region,
                        operatingSystem: dto.os,
                        cpu: product.cpu,
                        ram: product.ram,
                        storage: product.storage,
                        bandwidth: product.bandwidth,
                        transfer: product.transfer,
                        ipAddress: dto.ipAddress,
                        username: dto.username,
                        password: dto.password ?? null,
                        status: VpsStatus.active,
                        expiredAt: dto.expiresAt
                            ? new Date(dto.expiresAt)
                            : null,
                    },
                })

                const updatedOrder = await transaction.order.updateMany({
                    where: { id: order.id, status: OrderStatus.paid },
                    data: { status: OrderStatus.active },
                })
                if (updatedOrder.count !== 1) {
                    throw new ConflictException(
                        'Order is no longer eligible for provisioning',
                    )
                }

                return vps
            })
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException(
                    'A VPS instance already exists for this order',
                )
            }
            throw error
        }
    }

    async update(id: number, dto: UpdateVpsInstanceDto) {
        await this.getOrThrow(id)
        const data: Record<string, unknown> = { ...dto }
        if (dto.expiredAt) {
            data.expiredAt = new Date(dto.expiredAt)
        }
        return this.prisma.vpsInstance.update({ where: { id }, data })
    }

    async updateStatus(id: number, dto: UpdateVpsStatusDto) {
        const vps = await this.getOrThrow(id)
        if (vps.status === dto.status) {
            return vps
        }
        const allowed = STATUS_TRANSITIONS[vps.status] ?? []
        if (!allowed.includes(dto.status)) {
            throw new BadRequestException(
                `Invalid status transition: ${vps.status} -> ${dto.status}`,
            )
        }
        const vpsUpdate = await this.prisma.vpsInstance.update({
            where: { id },
            data: { status: dto.status },
        })

        // When the VPS goes active, mark its order active too.
        if (dto.status === VpsStatus.active && vps.orderId) {
            await this.prisma.order.update({
                where: { id: vps.orderId },
                data: { status: OrderStatus.active },
            })
        }
        return vpsUpdate
    }

    private async getOrThrow(id: number) {
        const vps = await this.prisma.vpsInstance.findUnique({ where: { id } })
        if (!vps) {
            throw new NotFoundException('VPS not found')
        }
        return vps
    }
}
