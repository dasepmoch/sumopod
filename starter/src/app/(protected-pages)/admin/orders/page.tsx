'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import Spinner from '@/components/ui/Spinner'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import {
    apiAdminApproveOrder,
    apiAdminCancelOrder,
    apiAdminCreateVpsFromOrder,
    apiAdminGetOrders,
} from '@/services/VpsService'
import { OrderStatusTag } from '../../_shared/StatusTag'
import { formatDate, formatIDR } from '../../_shared/statusHelpers'
import { useRouter } from 'next/navigation'
import type { Order } from '@/@types/vps'

const { Tr, Th, Td, THead, TBody } = Table

const notify = (title: string, type: 'success' | 'danger', msg: string) =>
    toast.push(
        <Notification title={title} type={type}>
            {msg}
        </Notification>,
    )

const AdminOrdersPage = () => {
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [busyId, setBusyId] = useState<number | null>(null)

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

    const handleCreateVps = async (id: number) => {
        try {
            setBusyId(id)
            const vps = await apiAdminCreateVpsFromOrder(id)
            notify('VPS created', 'success', 'Now fill in the VPS details.')
            router.push(`/admin/vps?focus=${vps.id}`)
        } catch {
            notify(
                'Failed',
                'danger',
                'Could not create VPS. Approve the order first.',
            )
        } finally {
            setBusyId(null)
        }
    }

    return (
        <div>
            <div className="mb-6">
                <h3 className="mb-1">Orders</h3>
                <p className="text-gray-500">Review and approve user orders</p>
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
                                                        loading={busyId === o.id}
                                                        onClick={() =>
                                                            handleApprove(o.id)
                                                        }
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        loading={busyId === o.id}
                                                        onClick={() =>
                                                            handleCancel(o.id)
                                                        }
                                                    >
                                                        Cancel
                                                    </Button>
                                                </>
                                            )}
                                            {(o.status === 'approved' ||
                                                o.status ===
                                                    'provisioning') && (
                                                <Button
                                                    size="xs"
                                                    variant="solid"
                                                    loading={busyId === o.id}
                                                    onClick={() =>
                                                        handleCreateVps(o.id)
                                                    }
                                                >
                                                    Create VPS
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
        </div>
    )
}

export default AdminOrdersPage
