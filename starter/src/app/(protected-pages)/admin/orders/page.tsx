'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Table from '@/components/ui/Table'
import Spinner from '@/components/ui/Spinner'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { FormItem } from '@/components/ui/Form'
import {
    apiAdminApproveOrder,
    apiAdminCancelOrder,
    apiAdminCreateVpsFromOrder,
    apiAdminGetOrders,
} from '@/services/VpsService'
import { OrderStatusTag } from '../../_shared/StatusTag'
import { formatDate, formatIDR } from '../../_shared/statusHelpers'
import type { Order } from '@/@types/vps'

const { Tr, Th, Td, THead, TBody } = Table

const notify = (title: string, type: 'success' | 'danger', msg: string) =>
    toast.push(
        <Notification title={title} type={type}>
            {msg}
        </Notification>,
    )

const getErrorMessage = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
        return 'Could not provision VPS.'
    }

    const message = error.response?.data?.message
    if (Array.isArray(message)) {
        return message.join(', ')
    }
    return typeof message === 'string' ? message : 'Could not provision VPS.'
}

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [busyId, setBusyId] = useState<number | null>(null)
    const [provisioningOrder, setProvisioningOrder] = useState<Order | null>(
        null,
    )
    const [form, setForm] = useState({
        ipAddress: '',
        username: '',
        password: '',
        expiresAt: '',
    })

    const load = () => {
        setLoading(true)
        apiAdminGetOrders()
            .then(setOrders)
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        load()
    }, [])

    const handleApprove = async (id: number) => {
        try {
            setBusyId(id)
            await apiAdminApproveOrder(id)
            notify('Approved', 'success', 'Order approved.')
            load()
        } catch {
            notify('Failed', 'danger', 'Could not approve order.')
        } finally {
            setBusyId(null)
        }
    }

    const handleCancel = async (id: number) => {
        try {
            setBusyId(id)
            await apiAdminCancelOrder(id)
            notify('Cancelled', 'success', 'Order cancelled.')
            load()
        } catch {
            notify('Failed', 'danger', 'Could not cancel order.')
        } finally {
            setBusyId(null)
        }
    }

    const openProvisionForm = (order: Order) => {
        setProvisioningOrder(order)
        setForm({
            ipAddress: '',
            username: '',
            password: '',
            expiresAt: '',
        })
    }

    const closeProvisionForm = () => {
        if (busyId === provisioningOrder?.id) {
            return
        }
        setProvisioningOrder(null)
    }

    const handleCreateVps = async () => {
        if (!provisioningOrder) {
            return
        }
        if (!form.ipAddress.trim() || !form.username.trim()) {
            notify(
                'Missing details',
                'danger',
                'IP address and username are required.',
            )
            return
        }

        try {
            setBusyId(provisioningOrder.id)
            await apiAdminCreateVpsFromOrder(provisioningOrder.id, {
                hostname: provisioningOrder.vpsName,
                ipAddress: form.ipAddress.trim(),
                os: provisioningOrder.selectedOs || '',
                username: form.username.trim(),
                password: form.password.trim() || undefined,
                expiresAt: form.expiresAt
                    ? new Date(form.expiresAt).toISOString()
                    : undefined,
            })
            notify('VPS provisioned', 'success', 'The VPS is now active.')
            setProvisioningOrder(null)
            load()
        } catch (error) {
            notify('Provisioning failed', 'danger', getErrorMessage(error))
        } finally {
            setBusyId(null)
        }
    }

    return (
        <div>
            <div className="mb-6">
                <h3 className="mb-1">Orders</h3>
                <p className="text-gray-500">
                    Provision paid orders with server connection details
                </p>
            </div>
            <Card>
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner size={40} />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        No orders yet.
                    </div>
                ) : (
                    <Table>
                        <THead>
                            <Tr>
                                <Th>#</Th>
                                <Th>VPS Name</Th>
                                <Th>User</Th>
                                <Th>Product</Th>
                                <Th>OS</Th>
                                <Th>Total</Th>
                                <Th>Status</Th>
                                <Th>Date</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {orders.map((o) => (
                                <Tr key={o.id}>
                                    <Td>{o.id}</Td>
                                    <Td className="font-semibold">
                                        {o.vpsName}
                                    </Td>
                                    <Td>{o.user?.email || o.userId}</Td>
                                    <Td>{o.product?.name || o.productId}</Td>
                                    <Td>{o.selectedOs || '-'}</Td>
                                    <Td>{formatIDR(o.totalPrice)}</Td>
                                    <Td>
                                        <OrderStatusTag status={o.status} />
                                    </Td>
                                    <Td>{formatDate(o.createdAt)}</Td>
                                    <Td>
                                        <div className="flex gap-2">
                                            {o.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="xs"
                                                        variant="solid"
                                                        loading={
                                                            busyId === o.id
                                                        }
                                                        onClick={() =>
                                                            handleApprove(o.id)
                                                        }
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        loading={
                                                            busyId === o.id
                                                        }
                                                        onClick={() =>
                                                            handleCancel(o.id)
                                                        }
                                                    >
                                                        Cancel
                                                    </Button>
                                                </>
                                            )}
                                            {o.status === 'paid' && (
                                                <Button
                                                    size="xs"
                                                    variant="solid"
                                                    loading={busyId === o.id}
                                                    onClick={() =>
                                                        openProvisionForm(o)
                                                    }
                                                >
                                                    Provision VPS
                                                </Button>
                                            )}
                                        </div>
                                    </Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                )}
            </Card>

            <Dialog
                isOpen={Boolean(provisioningOrder)}
                onClose={closeProvisionForm}
                onRequestClose={closeProvisionForm}
            >
                <h5 className="mb-1">Provision VPS</h5>
                <p className="mb-4 text-sm text-gray-500">
                    Create an active VPS from paid order #
                    {provisioningOrder?.id}.
                </p>
                <FormItem label="Hostname">
                    <Input value={provisioningOrder?.vpsName || ''} readOnly />
                </FormItem>
                <FormItem label="Operating System">
                    <Input
                        value={provisioningOrder?.selectedOs || ''}
                        readOnly
                    />
                </FormItem>
                <FormItem label="IP Address">
                    <Input
                        value={form.ipAddress}
                        placeholder="103.10.20.30"
                        onChange={(event) =>
                            setForm({
                                ...form,
                                ipAddress: event.target.value,
                            })
                        }
                    />
                </FormItem>
                <FormItem label="Username">
                    <Input
                        value={form.username}
                        placeholder="root"
                        onChange={(event) =>
                            setForm({
                                ...form,
                                username: event.target.value,
                            })
                        }
                    />
                </FormItem>
                <FormItem label="Password (optional)">
                    <Input
                        type="password"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                password: event.target.value,
                            })
                        }
                    />
                </FormItem>
                <FormItem label="Expiry Date (optional)">
                    <Input
                        type="date"
                        value={form.expiresAt}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                expiresAt: event.target.value,
                            })
                        }
                    />
                </FormItem>
                <div className="flex justify-end gap-2 mt-2">
                    <Button onClick={closeProvisionForm}>Cancel</Button>
                    <Button
                        variant="solid"
                        loading={busyId === provisioningOrder?.id}
                        onClick={handleCreateVps}
                    >
                        Provision VPS
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default AdminOrdersPage
