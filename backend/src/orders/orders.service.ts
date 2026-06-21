import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { OrderStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateOrderDto } from './dto/order.dto'

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) {}

    async create(userId: number, dto: CreateOrderDto) {
        const product = await this.prisma.product.findFirst({
            where: { id: dto.productId, isActive: true },
        })
        if (!product) {
            throw new NotFoundException('Product not found or inactive')
        }

        return this.prisma.order.create({
            data: {
                userId,
                productId: product.id,
                vpsName: dto.vpsName,
                selectedOs: dto.selectedOs,
                status: OrderStatus.pending,
                totalPrice: product.priceMonthly,
                billingCycle: 'monthly',
            },
            include: {
                product: { select: { id: true, name: true } },
            },
        })
    }

    findMy(userId: number) {
        return this.prisma.order.findMany({
            where: { userId },
            orderBy: { id: 'desc' },
            include: {
                product: { select: { id: true, name: true, provider: true } },
            },
        })
    }

    async findOne(userId: number, role: string, id: number) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                product: true,
                user: { select: { id: true, name: true, email: true } },
            },
        })
        if (!order) {
            throw new NotFoundException('Order not found')
        }
        if (role !== 'ADMIN' && order.userId !== userId) {
            throw new ForbiddenException('Not your order')
        }
        return order
    }

    // ---- Admin ----
    findAllAdmin() {
        return this.prisma.order.findMany({
            orderBy: { id: 'desc' },
            include: {
                product: { select: { id: true, name: true, provider: true } },
                user: { select: { id: true, name: true, email: true } },
            },
        })
    }

    async approve(id: number) {
        const order = await this.prisma.order.findUnique({ where: { id } })
        if (!order) {
            throw new NotFoundException('Order not found')
        }
        if (order.status !== OrderStatus.pending) {
            throw new BadRequestException(
                `Only pending orders can be approved (current: ${order.status})`,
            )
        }
        return this.prisma.order.update({
            where: { id },
            data: { status: OrderStatus.approved },
        })
    }

    async cancel(id: number) {
        const order = await this.prisma.order.findUnique({ where: { id } })
        if (!order) {
            throw new NotFoundException('Order not found')
        }
        if (
            order.status === OrderStatus.active ||
            order.status === OrderStatus.cancelled
        ) {
            throw new BadRequestException(
                `Cannot cancel an order with status ${order.status}`,
            )
        }
        return this.prisma.order.update({
            where: { id },
            data: { status: OrderStatus.cancelled },
        })
    }
}
