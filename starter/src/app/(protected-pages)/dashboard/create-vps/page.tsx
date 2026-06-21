'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Spinner from '@/components/ui/Spinner'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { FormItem, Form } from '@/components/ui/Form'
import { apiCreateOrder, apiGetProducts } from '@/services/VpsService'
import { formatIDR } from '../../_shared/statusHelpers'
import { useRouter } from 'next/navigation'
import type { Product } from '@/@types/vps'

type Option = { value: string; label: string }

const CreateVpsPage = () => {
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [vpsName, setVpsName] = useState('')
    const [provider, setProvider] = useState<Option | null>(null)
    const [region, setRegion] = useState<Option | null>(null)
    const [plan, setPlan] = useState<Product | null>(null)
    const [os, setOs] = useState<Option | null>(null)

    useEffect(() => {
        apiGetProducts()
            .then((data) => setProducts(data))
            .finally(() => setLoading(false))
    }, [])

    const providerOptions: Option[] = useMemo(() => {
        const set = Array.from(new Set(products.map((p) => p.provider)))
        return set.map((p) => ({ value: p, label: p }))
    }, [products])

    const regionOptions: Option[] = useMemo(() => {
        if (!provider) return []
        const regions = Array.from(
            new Set(
                products
                    .filter((p) => p.provider === provider.value && p.region)
                    .map((p) => p.region as string),
            ),
        )
        return regions.map((r) => ({ value: r, label: r }))
    }, [products, provider])

    const planOptions = useMemo(() => {
        if (!provider) return []
        return products.filter(
            (p) =>
                p.provider === provider.value &&
                (!region || p.region === region.value),
        )
    }, [products, provider, region])

    const osOptions: Option[] = useMemo(() => {
        if (!plan?.osOptions) return []
        return plan.osOptions
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean)
            .map((o) => ({ value: o, label: o }))
    }, [plan])

    const resetDownstream = (level: 'provider' | 'region') => {
        if (level === 'provider') {
            setRegion(null)
        }
        setPlan(null)
        setOs(null)
    }

    const canSubmit = vpsName.trim() && plan

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!canSubmit || !plan) return
        try {
            setSubmitting(true)
            await apiCreateOrder({
                productId: plan.id,
                vpsName: vpsName.trim(),
                selectedOs: os?.value,
            })
            toast.push(
                <Notification title="Order created" type="success">
                    Your order is pending admin approval.
                </Notification>,
            )
            router.push('/dashboard/vps')
        } catch {
            toast.push(
                <Notification title="Failed" type="danger">
                    Could not create the order. Please try again.
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Spinner size={40} />
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                <h3 className="mb-1">Create VPS</h3>
                <p className="text-gray-500">
                    Configure and order a new VPS instance
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <Card>
                        <Form onSubmit={handleSubmit}>
                            <FormItem label="VPS Name">
                                <Input
                                    placeholder="my-vps-01"
                                    value={vpsName}
                                    onChange={(e) => setVpsName(e.target.value)}
                                />
                            </FormItem>
                            <FormItem label="Provider">
                                <Select<Option>
                                    placeholder="Select provider"
                                    options={providerOptions}
                                    value={provider}
                                    onChange={(opt) => {
                                        setProvider(opt)
                                        resetDownstream('provider')
                                    }}
                                />
                            </FormItem>
                            <FormItem label="Region">
                                <Select<Option>
                                    placeholder="Select region"
                                    options={regionOptions}
                                    value={region}
                                    isDisabled={!provider}
                                    onChange={(opt) => {
                                        setRegion(opt)
                                        resetDownstream('region')
                                    }}
                                />
                            </FormItem>
                            <FormItem label="Server Plan">
                                <Select<Product>
                                    placeholder="Select plan"
                                    options={planOptions}
                                    value={plan}
                                    isDisabled={!provider}
                                    getOptionLabel={(p) =>
                                        `${p.name} — ${p.cpu} vCPU / ${p.ram} GB RAM / ${p.storage} GB`
                                    }
                                    getOptionValue={(p) => String(p.id)}
                                    onChange={(opt) => {
                                        setPlan(opt)
                                        setOs(null)
                                    }}
                                />
                            </FormItem>
                            <FormItem label="Operating System">
                                <Select<Option>
                                    placeholder="Select OS"
                                    options={osOptions}
                                    value={os}
                                    isDisabled={!plan}
                                    onChange={(opt) => setOs(opt)}
                                />
                            </FormItem>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    onClick={() => router.push('/dashboard')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="solid"
                                    loading={submitting}
                                    disabled={!canSubmit}
                                >
                                    Create VPS
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </div>
                <div>
                    <Card>
                        <h5 className="mb-4">Configuration Summary</h5>
                        <SummaryRow label="VPS Name" value={vpsName || '-'} />
                        <SummaryRow
                            label="Provider"
                            value={provider?.label || '-'}
                        />
                        <SummaryRow
                            label="Region"
                            value={region?.label || '-'}
                        />
                        <SummaryRow label="Plan" value={plan?.name || '-'} />
                        <SummaryRow
                            label="CPU"
                            value={plan ? `${plan.cpu} vCPU` : '-'}
                        />
                        <SummaryRow
                            label="RAM"
                            value={plan ? `${plan.ram} GB` : '-'}
                        />
                        <SummaryRow
                            label="Storage"
                            value={plan ? `${plan.storage} GB` : '-'}
                        />
                        <SummaryRow
                            label="Transfer"
                            value={plan?.transfer || '-'}
                        />
                        <SummaryRow
                            label="Bandwidth"
                            value={plan?.bandwidth || '-'}
                        />
                        <SummaryRow label="OS" value={os?.label || '-'} />
                        <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
                        <div className="flex items-center justify-between">
                            <span className="font-semibold">Total / month</span>
                            <span className="text-lg font-bold">
                                {plan ? formatIDR(plan.priceMonthly) : '-'}
                            </span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between py-1.5">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold heading-text">{value}</span>
    </div>
)

export default CreateVpsPage
