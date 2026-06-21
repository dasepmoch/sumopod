'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { apiGetMyOrders, apiGetMyVps } from '@/services/VpsService'
import { useRouter } from 'next/navigation'
import type { Order, VpsInstance } from '@/@types/vps'

const DashboardPage = () => {
    const router = useRouter()
    const [vps, setVps] = useState<VpsInstance[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([apiGetMyVps(), apiGetMyOrders()])
            .then(([vpsData, orderData]) => {
                setVps(vpsData)
                setOrders(orderData)
            })
            .finally(() => setLoading(false))
    }, [])

    const activeVps = vps.filter((v) => v.status === 'active').length
    const pendingOrders = orders.filter((o) => o.status === 'pending').length

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="mb-1">Dashboard</h3>
                    <p className="text-gray-500">
                        Overview of your VPS services
                    </p>
                </div>
                <Button
                    variant="solid"
                    onClick={() => router.push('/dashboard/create-vps')}
                >
                    Create VPS
                </Button>
            </div>
            {loading ? (
                <div className="flex justify-center py-20">
                    <Spinner size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <span className="text-gray-500">Total VPS</span>
                        <h2 className="mt-2">{vps.length}</h2>
                    </Card>
                    <Card>
                        <span className="text-gray-500">Active VPS</span>
                        <h2 className="mt-2">{activeVps}</h2>
                    </Card>
                    <Card>
                        <span className="text-gray-500">Pending Orders</span>
                        <h2 className="mt-2">{pendingOrders}</h2>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default DashboardPage
