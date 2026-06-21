import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { OrderStatus, ProvisioningType, VpsStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { ProvidersService } from '../providers/providers.service'
import {
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
    constructor(
        private prisma: PrismaService,
        private providers: ProvidersService,
    ) {}

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

    /**
     * Create a VPS instance from an approved order.
     * Snapshots the product spec, links the provider account, and runs the
     * matching provider adapter. Manual products stay in "provisioning" until
     * the admin fills connection details.
     */
    async createFromOrder(orderId: number) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { product: true },
        })
        if (!order) {
            throw new NotFoundException('Order not found')
        }
        if (
            order.status !== OrderStatus.approved &&
            order.status !== OrderStatus.provisioning
        ) {
            throw new BadRequestException(
                `Order must be approved first (current: ${order.status})`,
            )
        }

        const existing = await this.prisma.vpsInstance.findFirst({
            where: { orderId },
        })
        if (existing) {
            throw new BadRequestException(
                'A VPS instance already exists for this order',
            )
        }

        const product = order.product
        const providerAccount = await this.prisma.providerAccount.findUnique({
            where: { id: product.providerAccountId },
        })

        // Mark order as provisioning while we set things up.
        await this.prisma.order.update({
            where: { id: orderId },
            data: { status: OrderStatus.provisioning },
        })

        // Run the matching provider adapter.
        let provisioned: {
            ipAddress?: string
            username?: string
            password?: string
        } = {}

        if (product.provisioningType === ProvisioningType.api) {
            const adapter = this.providers.getAdapter(product.provider)
            const result = await adapter.createVps({
                vpsName: order.vpsName,
                region: product.region ?? undefined,
                operatingSystem: order.selectedOs ?? undefined,
                cpu: product.cpu,
                ram: product.ram,
                storage: product.storage,
                providerAccount: {
                    apiKey: providerAccount?.apiKey,
                    apiSecret: providerAccount?.apiSecret,
                    regionDefault: providerAccount?.regionDefault,
                },
            })
            provisioned = {
                ipAddress: result.ipAddress,
                username: result.username,
                password: result.password,
            }
        }

        return this.prisma.vpsInstance.create({
            data: {
                userId: order.userId,
                orderId: order.id,
                productId: product.id,
                providerAccountId: product.providerAccountId,
                vpsName: order.vpsName,
                provider: product.provider,
                region: product.region,
                operatingSystem: order.selectedOs ?? null,
                cpu: product.cpu,
                ram: product.ram,
                storage: product.storage,
                bandwidth: product.bandwidth,
                transfer: product.transfer,
                ipAddress: provisioned.ipAddress ?? null,
                username: provisioned.username ?? null,
                password: provisioned.password ?? null,
                status: VpsStatus.provisioning,
            },
        })
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
