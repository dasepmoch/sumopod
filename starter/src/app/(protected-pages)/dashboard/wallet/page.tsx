'use client'

import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import Table from '@/components/ui/Table'
import Tag from '@/components/ui/Tag'
import {
    apiGetMyWallet,
    apiGetMyWalletTransactions,
} from '@/services/WalletService'
import { formatIDR } from '../../_shared/statusHelpers'
import type { UserWalletTransaction, Wallet } from '@/@types/wallet'

const { Tr, Th, Td, THead, TBody } = Table

const getErrorMessage = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
        return 'Could not load your wallet activity. Please try again.'
    }

    const message = error.response?.data?.message
    if (Array.isArray(message)) {
        return message.join(', ')
    }

    return typeof message === 'string'
        ? message
        : 'Could not load your wallet activity. Please try again.'
}

const formatAmount = (value: string | number, currency: string) => {
    if (currency === 'IDR') {
        return formatIDR(value)
    }

    const amount = typeof value === 'string' ? Number(value) : value
    if (!Number.isFinite(amount)) {
        return `${value} ${currency}`
    }

    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
        }).format(amount)
    } catch {
        return `${amount.toLocaleString('en-US')} ${currency}`
    }
}

const formatDateTime = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return '-'
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

const WalletPage = () => {
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [transactions, setTransactions] = useState<UserWalletTransaction[]>(
        [],
    )
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadWallet = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const [walletData, transactionData] = await Promise.all([
                apiGetMyWallet(),
                apiGetMyWalletTransactions({ limit: 50 }),
            ])
            setWallet(walletData)
            setTransactions(transactionData)
        } catch (requestError) {
            setWallet(null)
            setTransactions([])
            setError(getErrorMessage(requestError))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadWallet()
    }, [loadWallet])

    return (
        <div>
            <div className="mb-6">
                <h3 className="mb-1">Wallet</h3>
                <p className="text-gray-500">
                    Review your balance and recent wallet activity.
                </p>
            </div>

            {loading ? (
                <Card>
                    <div className="flex justify-center py-16">
                        <Spinner size={40} />
                    </div>
                </Card>
            ) : error ? (
                <Card>
                    <div className="py-8">
                        <Alert
                            type="danger"
                            title="Wallet unavailable"
                            showIcon
                        >
                            {error}
                        </Alert>
                        <div className="mt-4 flex justify-end">
                            <Button onClick={loadWallet}>Retry</Button>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="flex flex-col gap-6">
                    <Card>
                        <span className="text-gray-500">Current balance</span>
                        <h2 className="mt-2">
                            {formatAmount(
                                wallet?.balance ?? 0,
                                wallet?.currency ?? 'IDR',
                            )}
                        </h2>
                        <div className="mt-1 text-sm text-gray-500">
                            {wallet?.currency ?? 'IDR'}
                        </div>
                    </Card>

                    <Card>
                        <div className="mb-6">
                            <h4 className="mb-1">Wallet Transactions</h4>
                            <p className="text-gray-500">
                                Your 50 most recent credits and debits.
                            </p>
                        </div>

                        {transactions.length === 0 ? (
                            <div className="py-16 text-center text-gray-500">
                                No wallet transactions yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <THead>
                                        <Tr>
                                            <Th>Created</Th>
                                            <Th>Direction</Th>
                                            <Th>Amount</Th>
                                            <Th>Description</Th>
                                        </Tr>
                                    </THead>
                                    <TBody>
                                        {transactions.map((transaction) => (
                                            <Tr key={transaction.id}>
                                                <Td className="whitespace-nowrap">
                                                    {formatDateTime(
                                                        transaction.createdAt,
                                                    )}
                                                </Td>
                                                <Td>
                                                    <Tag
                                                        className={
                                                            transaction.direction ===
                                                            'CREDIT'
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100'
                                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100'
                                                        }
                                                    >
                                                        {transaction.direction ===
                                                        'CREDIT'
                                                            ? 'Credit'
                                                            : 'Debit'}
                                                    </Tag>
                                                </Td>
                                                <Td className="whitespace-nowrap">
                                                    <div
                                                        className={
                                                            transaction.direction ===
                                                            'CREDIT'
                                                                ? 'font-semibold text-emerald-600'
                                                                : 'font-semibold text-amber-600'
                                                        }
                                                    >
                                                        {transaction.direction ===
                                                        'CREDIT'
                                                            ? '+'
                                                            : '-'}
                                                        {formatAmount(
                                                            transaction.amount,
                                                            transaction.currency,
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {transaction.currency}
                                                    </div>
                                                </Td>
                                                <Td>
                                                    {transaction.description ||
                                                        '-'}
                                                </Td>
                                            </Tr>
                                        ))}
                                    </TBody>
                                </Table>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    )
}

export default WalletPage
