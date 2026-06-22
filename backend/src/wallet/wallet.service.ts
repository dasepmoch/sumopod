import { Injectable, NotFoundException } from '@nestjs/common'
import {
    Prisma,
    Role,
    WalletTransactionDirection,
    WalletTransactionStatus,
    WalletTransactionType,
} from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreditWalletDto } from './dto/credit-wallet.dto'
import { MyWalletTransactionsQueryDto } from './dto/my-wallet-transactions-query.dto'
import { WalletTransactionsQueryDto } from './dto/wallet-transactions-query.dto'

@Injectable()
export class WalletService {
    constructor(private prisma: PrismaService) {}

    findUsers() {
        return this.prisma.user.findMany({
            where: { role: Role.USER },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                wallet: {
                    select: {
                        balance: true,
                        currency: true,
                        updatedAt: true,
                    },
                },
            },
            orderBy: { email: 'asc' },
        })
    }

    findMine(userId: number) {
        return this.prisma.wallet.upsert({
            where: { userId },
            update: {},
            create: { userId },
        })
    }

    async findMyTransactions(
        userId: number,
        query: MyWalletTransactionsQueryDto,
    ) {
        const transactions = await this.prisma.walletTransaction.findMany({
            where: {
                userId,
                ...(query.direction && { direction: query.direction }),
            },
            select: {
                id: true,
                walletId: true,
                wallet: {
                    select: {
                        currency: true,
                    },
                },
                direction: true,
                amount: true,
                description: true,
                createdAt: true,
            },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: query.limit ?? 50,
        })

        return transactions.map(({ wallet, ...transaction }) => ({
            ...transaction,
            currency: wallet.currency,
        }))
    }

    async findTransactions(query: WalletTransactionsQueryDto) {
        const search = query.search?.trim()
        const where: Prisma.WalletTransactionWhereInput = {
            ...(query.userId !== undefined && { userId: query.userId }),
            ...(query.direction && { direction: query.direction }),
            ...(search && {
                user: {
                    is: {
                        OR: [
                            { email: { contains: search } },
                            { name: { contains: search } },
                        ],
                    },
                },
            }),
        }

        const transactions = await this.prisma.walletTransaction.findMany({
            where,
            select: {
                id: true,
                userId: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                walletId: true,
                wallet: {
                    select: {
                        currency: true,
                    },
                },
                type: true,
                direction: true,
                amount: true,
                description: true,
                referenceType: true,
                referenceId: true,
                createdAt: true,
            },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: query.limit ?? 50,
        })

        return transactions.map(({ wallet, ...transaction }) => ({
            ...transaction,
            currency: wallet.currency,
        }))
    }

    async credit(userId: number, dto: CreditWalletDto) {
        const amount = new Prisma.Decimal(dto.amount.toString())

        return this.prisma.$transaction(async (transaction) => {
            const user = await transaction.user.findUnique({
                where: { id: userId },
                select: { id: true },
            })
            if (!user) {
                throw new NotFoundException('User not found')
            }

            const wallet = await transaction.wallet.upsert({
                where: { userId },
                update: {},
                create: { userId },
            })

            const updatedWallet = await transaction.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: {
                        increment: amount,
                    },
                },
            })

            const walletTransaction =
                await transaction.walletTransaction.create({
                    data: {
                        userId,
                        walletId: wallet.id,
                        type: WalletTransactionType.ADJUSTMENT,
                        direction: WalletTransactionDirection.CREDIT,
                        amount,
                        status: WalletTransactionStatus.SUCCESS,
                        description: dto.description,
                    },
                })

            return {
                wallet: updatedWallet,
                transaction: walletTransaction,
            }
        })
    }
}
