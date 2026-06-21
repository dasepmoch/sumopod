import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProductDto, UpdateProductDto } from './dto/product.dto'

// Public view hides internal cost and provider account credentials.
const publicSelect: Prisma.ProductSelect = {
    id: true,
    name: true,
    provider: true,
    region: true,
    cpu: true,
    ram: true,
    storage: true,
    bandwidth: true,
    transfer: true,
    priceMonthly: true,
    osOptions: true,
    provisioningType: true,
    isActive: true,
}

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) {}

    // ---- Public / user ----
    findAllPublic() {
        return this.prisma.product.findMany({
            where: { isActive: true },
            select: publicSelect,
            orderBy: { priceMonthly: 'asc' },
        })
    }

    async findOnePublic(id: number) {
        const product = await this.prisma.product.findFirst({
            where: { id, isActive: true },
            select: publicSelect,
        })
        if (!product) {
            throw new NotFoundException('Product not found')
        }
        return product
    }

    // ---- Admin ----
    findAllAdmin() {
        return this.prisma.product.findMany({
            orderBy: { id: 'asc' },
            include: {
                providerAccount: {
                    select: { id: true, name: true, provider: true },
                },
            },
        })
    }

    async findOneAdmin(id: number) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                providerAccount: {
                    select: { id: true, name: true, provider: true },
                },
            },
        })
        if (!product) {
            throw new NotFoundException('Product not found')
        }
        return product
    }

    create(dto: CreateProductDto) {
        return this.prisma.product.create({ data: dto })
    }

    async update(id: number, dto: UpdateProductDto) {
        await this.findOneAdmin(id)
        return this.prisma.product.update({ where: { id }, data: dto })
    }

    async remove(id: number) {
        await this.findOneAdmin(id)
        await this.prisma.product.delete({ where: { id } })
        return { success: true }
    }
}
