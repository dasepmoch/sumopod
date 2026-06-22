'use client'

import { useCallback, useEffect, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import Table from '@/components/ui/Table'
import { apiGetMyVps } from '@/services/VpsService'
import { VpsStatusTag } from '../../_shared/StatusTag'
import { formatDate } from '../../_shared/statusHelpers'
import { useRouter } from 'next/navigation'
import type { VpsInstance } from '@/@types/vps'

const { Tr, Th, Td, THead, TBody } = Table

const MyVpsPage = () => {
    const router = useRouter()
    const [vps, setVps] = useState<VpsInstance[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const loadVps = useCallback(async () => {
        setLoading(true)
        setError(false)

        try {
            setVps(await apiGetMyVps())
        } catch {
            setVps([])
            setError(true)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadVps()
    }, [loadVps])

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="mb-1">My VPS</h3>
                    <p className="text-gray-500">All VPS instances you own</p>
                </div>
                <Button
                    variant="solid"
                    onClick={() => router.push('/dashboard/create-vps')}
                >
                    Create VPS
                </Button>
            </div>
            <Card>
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner size={40} />
                    </div>
                ) : error ? (
                    <div className="mx-auto max-w-xl py-8">
                        <Alert
                            type="danger"
                            title="Unable to load VPS instances"
                            showIcon
                        >
                            Check the backend connection and try again.
                        </Alert>
                        <div className="mt-4 flex justify-center">
                            <Button onClick={loadVps}>Try again</Button>
                        </div>
                    </div>
                ) : vps.length === 0 ? (
                    <div className="py-16 text-center text-gray-500">
                        No VPS instances yet. Purchase a plan first.
                    </div>
                ) : (
                    <Table>
                        <THead>
                            <Tr>
                                <Th>Hostname</Th>
                                <Th>IP Address</Th>
                                <Th>OS</Th>
                                <Th>Username</Th>
                                <Th>Plan</Th>
                                <Th>Region</Th>
                                <Th>Status</Th>
                                <Th>Created</Th>
                                <Th>Expires</Th>
                                <Th>Action</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {vps.map((v) => (
                                <Tr key={v.id}>
                                    <Td className="font-semibold">
                                        {v.vpsName}
                                    </Td>
                                    <Td>{v.ipAddress || '-'}</Td>
                                    <Td>{v.operatingSystem || '-'}</Td>
                                    <Td>{v.username || '-'}</Td>
                                    <Td>
                                        <div className="font-semibold">
                                            {v.product?.name || '-'}
                                        </div>
                                        <div className="text-xs capitalize text-gray-500">
                                            {v.provider}
                                        </div>
                                    </Td>
                                    <Td>{v.region || '-'}</Td>
                                    <Td>
                                        <VpsStatusTag status={v.status} />
                                    </Td>
                                    <Td>{formatDate(v.createdAt)}</Td>
                                    <Td>{formatDate(v.expiredAt)}</Td>
                                    <Td>
                                        <Button
                                            size="xs"
                                            onClick={() =>
                                                router.push(
                                                    `/dashboard/vps/${v.id}`,
                                                )
                                            }
                                        >
                                            View details
                                        </Button>
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

export default MyVpsPage
