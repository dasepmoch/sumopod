'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Spinner from '@/components/ui/Spinner'
import { formatIDR } from '../../_shared/statusHelpers'
import {
    apiAdminCreditWallet,
    apiAdminGetWalletUsers,
} from '@/services/WalletService'
import type { AdminWalletUser } from '@/@types/wallet'

type UserOption = {
    value: number
    label: string
}

type Feedback = {
    type: 'success' | 'danger'
    title: string
    message: string
} | null

const getErrorMessage = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
        return 'Could not credit the wallet. Please try again.'
    }

    const message = error.response?.data?.message
    if (Array.isArray(message)) {
        return message.join(', ')
    }

    return typeof message === 'string'
        ? message
        : 'Could not credit the wallet. Please try again.'
}

const AdminWalletsPage = () => {
    const [users, setUsers] = useState<AdminWalletUser[]>([])
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [feedback, setFeedback] = useState<Feedback>(null)

    useEffect(() => {
        apiAdminGetWalletUsers()
            .then((walletUsers) => {
                setUsers(walletUsers)
                setSelectedUserId(walletUsers[0]?.id ?? null)
            })
            .catch((error) => {
                setFeedback({
                    type: 'danger',
                    title: 'Users unavailable',
                    message: getErrorMessage(error),
                })
            })
            .finally(() => setLoading(false))
    }, [])

    const userOptions = useMemo<UserOption[]>(
        () =>
            users.map((user) => ({
                value: user.id,
                label: `${user.name} — ${user.email} (#${user.id})`,
            })),
        [users],
    )

    const selectedUser =
        users.find((user) => user.id === selectedUserId) ?? null

    const handleSubmit = async () => {
        setFeedback(null)

        if (!selectedUser) {
            setFeedback({
                type: 'danger',
                title: 'User required',
                message: 'Select a user before crediting a wallet.',
            })
            return
        }

        if (!amount.trim()) {
            setFeedback({
                type: 'danger',
                title: 'Amount required',
                message: 'Enter a credit amount.',
            })
            return
        }

        const numericAmount = Number(amount)
        if (!Number.isFinite(numericAmount)) {
            setFeedback({
                type: 'danger',
                title: 'Invalid amount',
                message: 'Credit amount must be numeric.',
            })
            return
        }

        if (numericAmount <= 0) {
            setFeedback({
                type: 'danger',
                title: 'Invalid amount',
                message: 'Credit amount must be greater than zero.',
            })
            return
        }

        if (!Number.isSafeInteger(numericAmount)) {
            setFeedback({
                type: 'danger',
                title: 'Invalid amount',
                message: 'Credit amount must be a whole number.',
            })
            return
        }

        try {
            setSubmitting(true)
            const result = await apiAdminCreditWallet(selectedUser.id, {
                amount: numericAmount,
                description: description.trim() || undefined,
            })

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === selectedUser.id
                        ? {
                              ...user,
                              wallet: {
                                  balance: result.wallet.balance,
                                  currency: result.wallet.currency,
                                  updatedAt: result.wallet.updatedAt,
                              },
                          }
                        : user,
                ),
            )
            setAmount('')
            setDescription('')
            setFeedback({
                type: 'success',
                title: 'Wallet credited',
                message: `${selectedUser.email} now has ${formatIDR(result.wallet.balance)}.`,
            })
        } catch (error) {
            setFeedback({
                type: 'danger',
                title: 'Credit failed',
                message: getErrorMessage(error),
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            <div className="mb-6">
                <h3 className="mb-1">User Wallets</h3>
                <p className="text-gray-500">
                    Manually credit a customer wallet balance
                </p>
            </div>

            <Card className="max-w-3xl">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner size={40} />
                    </div>
                ) : users.length === 0 ? (
                    <div className="py-12">
                        {feedback ? (
                            <Alert
                                type={feedback.type}
                                title={feedback.title}
                                showIcon
                            >
                                {feedback.message}
                            </Alert>
                        ) : (
                            <div className="text-center text-gray-500">
                                No users are available for wallet credit.
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <FormItem label="User">
                            <Select<UserOption>
                                isSearchable
                                placeholder="Search by name, email, or user ID"
                                options={userOptions}
                                value={userOptions.find(
                                    (option) => option.value === selectedUserId,
                                )}
                                onChange={(option) => {
                                    setSelectedUserId(option?.value ?? null)
                                    setFeedback(null)
                                }}
                            />
                        </FormItem>

                        {selectedUser && (
                            <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50 sm:grid-cols-2">
                                <div>
                                    <div className="text-sm text-gray-500">
                                        Customer
                                    </div>
                                    <div className="mt-1 font-semibold">
                                        {selectedUser.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {selectedUser.email} · User #
                                        {selectedUser.id}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">
                                        Current balance
                                    </div>
                                    <div className="mt-1 text-xl font-semibold">
                                        {formatIDR(
                                            selectedUser.wallet?.balance ?? 0,
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {selectedUser.wallet?.currency ?? 'IDR'}
                                    </div>
                                </div>
                            </div>
                        )}

                        <FormItem label="Credit Amount">
                            <Input
                                type="number"
                                min="1"
                                step="1"
                                inputMode="numeric"
                                placeholder="100000"
                                value={amount}
                                invalid={
                                    feedback?.type === 'danger' &&
                                    feedback.title
                                        .toLowerCase()
                                        .includes('amount')
                                }
                                onChange={(event) =>
                                    setAmount(event.target.value)
                                }
                            />
                        </FormItem>

                        <FormItem label="Note (optional)">
                            <Input
                                textArea
                                rows={3}
                                maxLength={500}
                                placeholder="Manual credit for demo"
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                            />
                        </FormItem>

                        {feedback && (
                            <Alert
                                className="mb-5"
                                type={feedback.type}
                                title={feedback.title}
                                showIcon
                            >
                                {feedback.message}
                            </Alert>
                        )}

                        <div className="flex justify-end">
                            <Button
                                variant="solid"
                                loading={submitting}
                                disabled={!selectedUser || submitting}
                                onClick={handleSubmit}
                            >
                                Credit Wallet
                            </Button>
                        </div>
                    </>
                )}
            </Card>
        </div>
    )
}

export default AdminWalletsPage
