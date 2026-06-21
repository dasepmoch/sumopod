'use client'

import { useCallback, useEffect, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import Tag from '@/components/ui/Tag'
import { apiGetProducts } from '@/services/VpsService'
import { formatIDR } from '../../_shared/statusHelpers'
import type { Product } from '@/@types/vps'

const getOsOptions = (osOptions?: string | null) =>
    osOptions
        ?.split(',')
        .map((option) => option.trim())
        .filter(Boolean) ?? []

const CreateVpsPage = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const loadProducts = useCallback(async () => {
        setLoading(true)
        setError(false)

        try {
            const data = await apiGetProducts()
            setProducts(data.filter((product) => product.isActive))
        } catch {
            setProducts([])
            setError(true)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadProducts()
    }, [loadProducts])

    return (
        <div>
            <div className="mb-6">
                <h3 className="mb-1">Create VPS</h3>
                <p className="text-gray-500">
                    Choose an active VPS plan that fits your workload.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Spinner size={40} />
                </div>
            ) : error ? (
                <Card>
                    <div className="mx-auto max-w-xl py-8">
                        <Alert
                            type="danger"
                            title="Unable to load VPS products"
                            showIcon
                        >
                            Check the backend connection and try again.
                        </Alert>
                        <div className="mt-4 flex justify-center">
                            <Button onClick={loadProducts}>Try again</Button>
                        </div>
                    </div>
                </Card>
            ) : products.length === 0 ? (
                <Card>
                    <div className="py-16 text-center">
                        <h5 className="mb-2">No VPS products available</h5>
                        <p className="text-gray-500">
                            There are no active VPS plans to show right now.
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    )
}

const ProductCard = ({ product }: { product: Product }) => {
    const osOptions = getOsOptions(product.osOptions)

    return (
        <Card
            className="h-full"
            bodyClass="flex h-full flex-col"
            footer={{
                content: (
                    <Button
                        block
                        disabled
                        variant="solid"
                        aria-disabled="true"
                        title="Order creation is not available yet"
                    >
                        Select Plan
                    </Button>
                ),
            }}
        >
            <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                    <h4 className="mb-2">{product.name}</h4>
                    <div className="flex flex-wrap gap-2">
                        <Tag className="capitalize">{product.provider}</Tag>
                        <Tag>{product.region || 'Global'}</Tag>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold heading-text">
                        {formatIDR(product.priceMonthly)}
                    </div>
                    <span className="text-sm text-gray-500">per month</span>
                </div>
            </div>

            <dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-3">
                <ProductDetail label="CPU" value={`${product.cpu} vCPU`} />
                <ProductDetail label="RAM" value={`${product.ram} GB`} />
                <ProductDetail
                    label="Storage"
                    value={`${product.storage} GB`}
                />
                <ProductDetail
                    label="Bandwidth"
                    value={product.bandwidth || '-'}
                />
                <ProductDetail
                    label="Transfer"
                    value={product.transfer || '-'}
                />
                <ProductDetail
                    label="Provisioning"
                    value={product.provisioningType}
                    capitalize
                />
            </dl>

            <div className="mt-auto border-t border-gray-200 pt-4 dark:border-gray-700">
                <span className="mb-2 block text-sm text-gray-500">
                    Operating systems
                </span>
                {osOptions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {osOptions.map((option) => (
                            <Tag key={option}>{option}</Tag>
                        ))}
                    </div>
                ) : (
                    <span className="font-semibold heading-text">-</span>
                )}
            </div>
        </Card>
    )
}

const ProductDetail = ({
    label,
    value,
    capitalize = false,
}: {
    label: string
    value: string
    capitalize?: boolean
}) => (
    <div>
        <dt className="text-sm text-gray-500">{label}</dt>
        <dd
            className={`font-semibold heading-text ${capitalize ? 'capitalize' : ''}`}
        >
            {value}
        </dd>
    </div>
)

export default CreateVpsPage
