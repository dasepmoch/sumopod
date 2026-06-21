'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import {
    apiAdminGetOrders,
    apiAdminGetProducts,
    apiAdminGetVps,
    apiAdminGetProviderAccounts,
} from '@/services/VpsService'
import { useRouter } from 'next/navigation'

const AdminOverviewPage = () => {
    const router = useRouter()
    const [stats, setStats] = useState({
        products: 0,
        providerAccounts: 0,
        pendingOrders: 0,
        vps: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            apiAdminGetProducts(),
            apiAdminGetProviderAccounts(),
            apiAdminGetOrders(),
            apiAdminGetVps(),
        ])
            .then(([products, accounts, orders, vps]) => {
                setStats({
                    products: products.length,
                    providerAccounts: accounts.length,
                    pendingOrders: orders.filter(
                        (o) => o.status === 'pending',
                    ).length,
                    vps: vps.length,
                })
            })
            .finally(() => setLoading(false))
    }, [])

    const cards = [
        { label: 'Products', value: stats.products, path: '/admin/products' },
        {
            label: 'Provider Accounts',
            value: stats.providerAccounts,
            path: '/admin/provider-accounts',
        },
        {
            label: 'Pending Orders',
            value: stats.pendingOrders,
            path: '/admin/orders',
        },
        { label: 'VPS Instances', value: stats.vps, path: '/admin/vps' },
    ]

    return (
        <div>
            <div className="mb-6">
                <h3 className="mb-1">Admin Overview</h3>
                <p className="text-gray-500">Manage your VPS reseller</p>
            </div>
            {loading ? (
                <div className="flex justify-center py-20">
                    <Spinner size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cards.map((c) => (
                        <Card
                            key={c.label}
                            clickable
                            onClick={() => router.push(c.path)}
                        >
                            <span className="text-gray-500">{c.label}</span>
                            <h2 className="mt-2">{c.value}</h2>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AdminOverviewPage
