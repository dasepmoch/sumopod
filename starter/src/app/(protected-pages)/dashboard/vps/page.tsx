'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import Spinner from '@/components/ui/Spinner'
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

    useEffect(() => {
        apiGetMyVps()
            .then((data) => setVps(data))
            .finally(() => setLoading(false))
    }, [])

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
                ) : vps.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        You don&apos;t have any VPS yet.
                    </div>
                ) : (
                    <Table>
                        <THead>
                            <Tr>
                                <Th>VPS Name</Th>
                                <Th>IP Address</Th>
                                <Th>Provider</Th>
                                <Th>Region</Th>
                                <Th>Status</Th>
                                <Th>Expired</Th>
                                <Th></Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {vps.map((v) => (
                                <Tr key={v.id}>
                                    <Td className="font-semibold">
                                        {v.vpsName}
                                    </Td>
                                    <Td>{v.ipAddress || '-'}</Td>
                                    <Td className="capitalize">{v.provider}</Td>
                                    <Td>{v.region || '-'}</Td>
                                    <Td>
                                        <VpsStatusTag status={v.status} />
                                    </Td>
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
                                            Detail
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
