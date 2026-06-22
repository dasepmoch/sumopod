'use client'

import { FormEvent, useEffect, useState } from 'react'
import axios from 'axios'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Spinner from '@/components/ui/Spinner'
import Table from '@/components/ui/Table'
import Tag from '@/components/ui/Tag'
import { apiAdminGetWalletTransactions } from '@/services/WalletService'
import { formatIDR } from '../../_shared/statusHelpers'
import type {
    AdminWalletTransaction,
    WalletTransactionDirection,
} from '@/@types/wallet'

const { Tr, Th, Td, THead, TBody } = Table

type DirectionOption = {
    value: 'ALL' | WalletTransactionDirection
    label: string
}

type Filters = {
    search?: string
    direction?: WalletTransactionDirection
}

const directionOptions: DirectionOption[] = [
    { value: 'ALL', label: 'All directions' },
    { value: 'CREDIT', label: 'Credit' },
    { value: 'DEBIT', label: 'Debit' },
]

const getErrorMessage = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
        return 'Could not load wallet transactions. Please try again.'
    }

    const message = error.response?.data?.message
    if (Array.isArray(message)) {
        return message.join(', ')
    }

    return typeof message === 'string'
        ? message
        : 'Could not load wallet transactions. Please try again.'
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

const formatType = (type: AdminWalletTransaction['type']) =>
    type
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')

const AdminWalletTransactionsPage = () => {
    const [transactions, setTransactions] = useState<AdminWalletTransaction[]>(
        [],
    )
    const [search, setSearch] = useState('')
    const [direction, setDirection] = useState<DirectionOption>(
        directionOptions[0],
    )
    const [filters, setFilters] = useState<Filters>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let active = true

        setLoading(true)
        setError(null)

        apiAdminGetWalletTransactions({
            ...filters,
            limit: 50,
        })
            .then((result) => {
                if (active) {
                    setTransactions(result)
                }
            })
            .catch((requestError) => {
                if (active) {
                    setTransactions([])
                    setError(getErrorMessage(requestError))
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false)
                }
            })

        return () => {
            active = false
        }
    }, [filters, reloadKey])

    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const trimmedSearch = search.trim()

        setFilters({
            search: trimmedSearch || undefined,
            direction: direction.value === 'ALL' ? undefined : direction.value,
        })
    }

    const clearFilters = () => {
        setSearch('')
        setDirection(directionOptions[0])
        setFilters({})
    }

    return (
        <div>
            <div className="mb-6">
                <h3 className="mb-1">Wallet Transactions</h3>
                <p className="text-gray-500">
                    Review manual credits and wallet balance activity.
                </p>
            </div>

            <Card>
                <form
                    className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end"
                    onSubmit={applyFilters}
                >
                    <div className="flex-1">
                        <label className="mb-2 block text-sm font-semibold">
                            User
                        </label>
                        <Input
                            value={search}
                            placeholder="Search by name or email"
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>
                    <div className="w-full lg:w-56">
                        <label className="mb-2 block text-sm font-semibold">
                            Direction
                        </label>
                        <Select<DirectionOption>
                            options={directionOptions}
                            value={direction}
                            onChange={(option) =>
                                setDirection(option ?? directionOptions[0])
                            }
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" variant="solid">
                            Filter
                        </Button>
                        <Button type="button" onClick={clearFilters}>
                            Clear
                        </Button>
                    </div>
                </form>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner size={40} />
                    </div>
                ) : error ? (
                    <div className="py-8">
                        <Alert
                            type="danger"
                            title="Transactions unavailable"
                            showIcon
                        >
                            {error}
                        </Alert>
                        <div className="mt-4 flex justify-end">
                            <Button
                                onClick={() => setReloadKey((key) => key + 1)}
                            >
                                Retry
                            </Button>
                        </div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="py-16 text-center text-gray-500">
                        No wallet transactions match the current filters.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>Created</Th>
                                    <Th>User</Th>
                                    <Th>Activity</Th>
                                    <Th>Amount</Th>
                                    <Th>Description / Reference</Th>
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
                                            <div className="font-semibold">
                                                {transaction.user.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {transaction.user.email}
                                            </div>
                                        </Td>
                                        <Td>
                                            <div className="flex flex-col items-start gap-1">
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
                                                <span className="text-sm text-gray-500">
                                                    {formatType(
                                                        transaction.type,
                                                    )}
                                                </span>
                                            </div>
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
                                            <div>
                                                {transaction.description || '-'}
                                            </div>
                                            {(transaction.referenceType ||
                                                transaction.referenceId) && (
                                                <div className="mt-1 text-sm text-gray-500">
                                                    {transaction.referenceType ||
                                                        'Reference'}
                                                    {transaction.referenceId
                                                        ? ` #${transaction.referenceId}`
                                                        : ''}
                                                </div>
                                            )}
                                        </Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default AdminWalletTransactionsPage
