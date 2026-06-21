'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { apiGetVps } from '@/services/VpsService'
import { VpsStatusTag } from '../../../_shared/StatusTag'
import { formatDate } from '../../../_shared/statusHelpers'
import { useParams, useRouter } from 'next/navigation'
import type { VpsInstance } from '@/@types/vps'

const DetailRow = ({
    label,
    value,
}: {
    label: string
    value?: React.ReactNode
}) => (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold heading-text text-right">
            {value || '-'}
        </span>
    </div>
)

const VpsDetailPage = () => {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string
    const [vps, setVps] = useState<VpsInstance | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        if (!id) return
        apiGetVps(id)
            .then((data) => setVps(data))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Spinner size={40} />
            </div>
        )
    }

    if (notFound || !vps) {
        return (
            <Card>
                <div className="text-center py-16">
                    <p className="text-gray-500 mb-4">VPS not found.</p>
                    <Button onClick={() => router.push('/dashboard/vps')}>
                        Back to My VPS
                    </Button>
                </div>
            </Card>
        )
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="mb-1">{vps.vpsName}</h3>
                    <VpsStatusTag status={vps.status} />
                </div>
                <Button onClick={() => router.push('/dashboard/vps')}>
                    Back
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <h5 className="mb-4">Connection</h5>
                    <DetailRow label="IP Address" value={vps.ipAddress} />
                    <DetailRow label="Username" value={vps.username} />
                    <DetailRow label="Password" value={vps.password} />
                    <DetailRow
                        label="Operating System"
                        value={vps.operatingSystem}
                    />
                </Card>
                <Card>
                    <h5 className="mb-4">Specification</h5>
                    <DetailRow label="Provider" value={vps.provider} />
                    <DetailRow label="Region" value={vps.region} />
                    <DetailRow label="CPU" value={`${vps.cpu} vCPU`} />
                    <DetailRow label="RAM" value={`${vps.ram} GB`} />
                    <DetailRow label="Storage" value={`${vps.storage} GB`} />
                    <DetailRow label="Bandwidth" value={vps.bandwidth} />
                    <DetailRow label="Transfer" value={vps.transfer} />
                    <DetailRow
                        label="Expired At"
                        value={formatDate(vps.expiredAt)}
                    />
                </Card>
            </div>
        </div>
    )
}

export default VpsDetailPage
