'use client'

import { useCallback, useEffect, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Notification from '@/components/ui/Notification'
import Spinner from '@/components/ui/Spinner'
import toast from '@/components/ui/toast'
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
    <div className="flex items-center justify-between border-b border-gray-100 py-2.5 last:border-0 dark:border-gray-700">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold heading-text text-right">
            {value ?? '-'}
        </span>
    </div>
)

const VpsDetailPage = () => {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string
    const [vps, setVps] = useState<VpsInstance | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [credentialVisible, setCredentialVisible] = useState(false)

    const loadVps = useCallback(async () => {
        if (!id) return

        setLoading(true)
        setError(false)
        setCredentialVisible(false)

        try {
            setVps(await apiGetVps(id))
        } catch {
            setVps(null)
            setError(true)
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        loadVps()
    }, [loadVps])

    const copyCredential = async () => {
        if (!vps?.password) return

        try {
            await navigator.clipboard.writeText(vps.password)
            toast.push(
                <Notification title="Credential copied" type="success">
                    The VPS credential was copied to your clipboard.
                </Notification>,
            )
        } catch {
            toast.push(
                <Notification title="Copy failed" type="danger">
                    Copy the credential manually after revealing it.
                </Notification>,
            )
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Spinner size={40} />
            </div>
        )
    }

    if (error || !vps) {
        return (
            <Card>
                <div className="mx-auto max-w-xl py-12">
                    <Alert type="danger" title="VPS unavailable" showIcon>
                        This VPS is unavailable or you do not have access.
                    </Alert>
                    <div className="mt-4 flex justify-center gap-2">
                        <Button onClick={loadVps}>Try again</Button>
                        <Button
                            variant="solid"
                            onClick={() => router.push('/dashboard/vps')}
                        >
                            Back to My VPS
                        </Button>
                    </div>
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
                    <DetailRow
                        label="Operating System"
                        value={vps.operatingSystem}
                    />
                    <div className="border-b border-gray-100 py-3 last:border-0 dark:border-gray-700">
                        <div className="mb-2 flex items-center justify-between gap-4">
                            <span className="text-gray-500">Credential</span>
                            <span className="font-mono font-semibold heading-text break-all text-right">
                                {vps.password
                                    ? credentialVisible
                                        ? vps.password
                                        : '••••••••••••'
                                    : 'Credential not available'}
                            </span>
                        </div>
                        {vps.password && (
                            <div className="flex justify-end gap-2">
                                <Button
                                    size="xs"
                                    onClick={() =>
                                        setCredentialVisible(
                                            (visible) => !visible,
                                        )
                                    }
                                >
                                    {credentialVisible ? 'Hide' : 'Reveal'}
                                </Button>
                                <Button size="xs" onClick={copyCredential}>
                                    Copy
                                </Button>
                            </div>
                        )}
                        <p className="mt-2 text-right text-xs text-amber-600 dark:text-amber-300">
                            Keep this credential private.
                        </p>
                    </div>
                </Card>
                <Card>
                    <h5 className="mb-4">Service details</h5>
                    <DetailRow label="Plan" value={vps.product?.name || '-'} />
                    <DetailRow label="Provider" value={vps.provider} />
                    <DetailRow label="Region" value={vps.region} />
                    <DetailRow
                        label="Order"
                        value={vps.orderId ? `#${vps.orderId}` : '-'}
                    />
                    <DetailRow label="CPU" value={`${vps.cpu} vCPU`} />
                    <DetailRow label="RAM" value={`${vps.ram} GB`} />
                    <DetailRow label="Storage" value={`${vps.storage} GB`} />
                    <DetailRow label="Bandwidth" value={vps.bandwidth} />
                    <DetailRow label="Transfer" value={vps.transfer} />
                    <DetailRow
                        label="Created At"
                        value={formatDate(vps.createdAt)}
                    />
                    <DetailRow
                        label="Expires At"
                        value={formatDate(vps.expiredAt)}
                    />
                </Card>
            </div>
        </div>
    )
}

export default VpsDetailPage
