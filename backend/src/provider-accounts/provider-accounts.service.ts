import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import {
    CreateProviderAccountDto,
    UpdateProviderAccountDto,
} from './dto/provider-account.dto'

// Never expose api_key / api_secret to clients.
const safeSelect: Prisma.ProviderAccountSelect = {
    id: true,
    name: true,
    provider: true,
    regionDefault: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
}

@Injectable()
export class ProviderAccountsService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.providerAccount.findMany({
            select: safeSelect,
            orderBy: { id: 'asc' },
        })
    }

    async findOne(id: number) {
        const account = await this.prisma.providerAccount.findUnique({
            where: { id },
            select: safeSelect,
        })
        if (!account) {
            throw new NotFoundException('Provider account not found')
        }
        return account
    }

    create(dto: CreateProviderAccountDto) {
        return this.prisma.providerAccount.create({
            data: dto,
            select: safeSelect,
        })
    }

    async update(id: number, dto: UpdateProviderAccountDto) {
        await this.findOne(id)
        return this.prisma.providerAccount.update({
            where: { id },
            data: dto,
            select: safeSelect,
        })
    }

    async remove(id: number) {
        await this.findOne(id)
        await this.prisma.providerAccount.delete({ where: { id } })
        return { success: true }
    }
}
