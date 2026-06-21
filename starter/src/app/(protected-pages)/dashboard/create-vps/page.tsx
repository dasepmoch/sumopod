'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Spinner from '@/components/ui/Spinner'
import Tag from '@/components/ui/Tag'
import { apiCreateOrder, apiGetProducts } from '@/services/VpsService'
import { formatIDR } from '../../_shared/statusHelpers'
import type { FormEvent } from 'react'
import type { Order, Product } from '@/@types/vps'

type OsOption = {
    value: string
    label: string
}

const getOsOptions = (osOptions?: string | null) =>
    osOptions
        ?.split(',')
        .map((option) => option.trim())
        .filter(Boolean) ?? []

const validateHostname = (hostname: string) => {
    if (!hostname) {
        return 'Hostname is required.'
    }

    if (hostname.length < 3 || hostname.length > 63) {
        return 'Hostname must be between 3 and 63 characters.'
    }

    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/.test(hostname)) {
        return 'Use lowercase letters, numbers, and hyphens. Do not start or end with a hyphen.'
    }

    return ''
}

const getRequestError = (error: unknown) => {
    if (isAxiosError(error)) {
        const message = error.response?.data?.message

        if (Array.isArray(message)) {
            return message.join(' ')
        }

        if (typeof message === 'string') {
            return message
        }
    }

    return 'Unable to create the order. Please try again.'
}

const CreateVpsPage = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [productsLoading, setProductsLoading] = useState(true)
    const [productsError, setProductsError] = useState(false)
    const [selectedProductId, setSelectedProductId] = useState<number | null>(
        null,
    )
    const [hostname, setHostname] = useState('')
    const [hostnameTouched, setHostnameTouched] = useState(false)
    const [selectedOs, setSelectedOs] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [createdOrder, setCreatedOrder] = useState<Order | null>(null)

    const selectedProduct =
        products.find((product) => product.id === selectedProductId) ?? null
    const osOptions = useMemo<OsOption[]>(
        () =>
            getOsOptions(selectedProduct?.osOptions).map((option) => ({
                value: option,
                label: option,
            })),
        [selectedProduct?.osOptions],
    )
    const hostnameError = validateHostname(hostname)
    const canSubmit = Boolean(
        selectedProduct &&
            selectedOs &&
            !hostnameError &&
            !submitting &&
            osOptions.length > 0,
    )

    const loadProducts = useCallback(async () => {
        setProductsLoading(true)
        setProductsError(false)

        try {
            const data = await apiGetProducts()
            setProducts(data.filter((product) => product.isActive))
        } catch {
            setProducts([])
            setProductsError(true)
        } finally {
            setProductsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadProducts()
    }, [loadProducts])

    const clearFeedback = () => {
        setSubmitError('')
        setCreatedOrder(null)
    }

    const handleSelectProduct = (product: Product) => {
        setSelectedProductId(product.id)
        setSelectedOs('')
        clearFeedback()
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setHostnameTouched(true)

        if (!canSubmit || !selectedProduct) {
            return
        }

        setSubmitting(true)
        setSubmitError('')
        setCreatedOrder(null)

        try {
            const order = await apiCreateOrder({
                productId: selectedProduct.id,
                vpsName: hostname,
                selectedOs,
            })
            setCreatedOrder(order)
            setHostname('')
            setHostnameTouched(false)
            setSelectedOs('')
        } catch (error) {
            setSubmitError(getRequestError(error))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            <div className="mb-6">
                <h3 className="mb-1">Create VPS</h3>
                <p className="text-gray-500">
                    Choose a plan and submit it for manual provisioning.
                </p>
            </div>

            {productsLoading ? (
                <div className="flex justify-center py-20">
                    <Spinner size={40} />
                </div>
            ) : productsError ? (
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
                <div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                selected={product.id === selectedProductId}
                                onSelect={() => handleSelectProduct(product)}
                            />
                        ))}
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                        <Card
                            className="xl:col-span-2"
                            header={{ content: 'Order configuration' }}
                        >
                            {createdOrder && (
                                <Alert
                                    className="mb-5"
                                    type="success"
                                    title={`Order #${createdOrder.id} created`}
                                    showIcon
                                >
                                    Order created. Admin will review and
                                    provision your VPS manually.
                                </Alert>
                            )}

                            {submitError && (
                                <Alert
                                    className="mb-5"
                                    type="danger"
                                    title="Unable to create order"
                                    showIcon
                                >
                                    {submitError}
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit}>
                                <FormItem
                                    asterisk
                                    htmlFor="hostname"
                                    label="Hostname"
                                    extra={
                                        <span className="ml-2 text-xs font-normal text-gray-500">
                                            3-63 lowercase letters, numbers, or
                                            hyphens
                                        </span>
                                    }
                                    invalid={
                                        hostnameTouched &&
                                        Boolean(hostnameError)
                                    }
                                    errorMessage={hostnameError}
                                >
                                    <Input
                                        id="hostname"
                                        autoComplete="off"
                                        placeholder="example-vps"
                                        value={hostname}
                                        disabled={submitting}
                                        onBlur={() => setHostnameTouched(true)}
                                        onChange={(event) => {
                                            setHostname(
                                                event.target.value.trim(),
                                            )
                                            clearFeedback()
                                        }}
                                    />
                                </FormItem>

                                <FormItem
                                    asterisk
                                    label="Operating System"
                                    extra={
                                        <span className="ml-2 text-xs font-normal text-gray-500">
                                            Options are provided by the selected
                                            plan
                                        </span>
                                    }
                                >
                                    <Select<OsOption>
                                        inputId="operating-system"
                                        placeholder={
                                            selectedProduct
                                                ? 'Select an operating system'
                                                : 'Select a plan first'
                                        }
                                        options={osOptions}
                                        value={
                                            osOptions.find(
                                                (option) =>
                                                    option.value === selectedOs,
                                            ) ?? null
                                        }
                                        isDisabled={
                                            !selectedProduct ||
                                            osOptions.length === 0 ||
                                            submitting
                                        }
                                        onChange={(option) => {
                                            setSelectedOs(option?.value ?? '')
                                            clearFeedback()
                                        }}
                                    />
                                    {selectedProduct &&
                                        osOptions.length === 0 && (
                                            <p className="mt-2 text-sm text-error">
                                                This plan has no operating
                                                systems available.
                                            </p>
                                        )}
                                </FormItem>

                                <Alert className="mb-5" type="info" showIcon>
                                    Orders are reviewed and provisioned
                                    manually. Creating an order does not
                                    activate a VPS.
                                </Alert>

                                <Button
                                    block
                                    type="submit"
                                    variant="solid"
                                    loading={submitting}
                                    disabled={!canSubmit}
                                    aria-disabled={!canSubmit}
                                >
                                    Create Order
                                </Button>
                            </form>
                        </Card>

                        <SelectedPlanSummary product={selectedProduct} />
                    </div>
                </div>
            )}
        </div>
    )
}

const ProductCard = ({
    product,
    selected,
    onSelect,
}: {
    product: Product
    selected: boolean
    onSelect: () => void
}) => {
    const osOptions = getOsOptions(product.osOptions)

    return (
        <Card
            className={`flex h-full flex-col ${selected ? 'ring-2 ring-primary' : ''}`}
            bodyClass="flex flex-1 flex-col"
            footer={{
                content: (
                    <Button
                        block
                        variant="solid"
                        active={selected}
                        onClick={onSelect}
                    >
                        {selected ? 'Selected Plan' : 'Select Plan'}
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

const SelectedPlanSummary = ({ product }: { product: Product | null }) => (
    <Card header={{ content: 'Selected plan' }}>
        {product ? (
            <div>
                <div className="mb-5">
                    <h4 className="mb-2">{product.name}</h4>
                    <div className="flex flex-wrap gap-2">
                        <Tag className="capitalize">{product.provider}</Tag>
                        <Tag>{product.region || 'Global'}</Tag>
                    </div>
                </div>

                <dl className="space-y-3">
                    <SummaryDetail
                        label="Monthly price"
                        value={formatIDR(product.priceMonthly)}
                    />
                    <SummaryDetail
                        label="Resources"
                        value={`${product.cpu} vCPU, ${product.ram} GB RAM, ${product.storage} GB storage`}
                    />
                    <SummaryDetail
                        label="Provisioning"
                        value={`${product.provisioningType} (admin review required)`}
                        capitalize
                    />
                </dl>
            </div>
        ) : (
            <div className="py-8 text-center">
                <h5 className="mb-2">No plan selected</h5>
                <p className="text-gray-500">
                    Select one of the available VPS plans to continue.
                </p>
            </div>
        )}
    </Card>
)

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

const SummaryDetail = ({
    label,
    value,
    capitalize = false,
}: {
    label: string
    value: string
    capitalize?: boolean
}) => (
    <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-3 last:border-0 last:pb-0 dark:border-gray-700">
        <dt className="text-sm text-gray-500">{label}</dt>
        <dd
            className={`text-right font-semibold heading-text ${capitalize ? 'capitalize' : ''}`}
        >
            {value}
        </dd>
    </div>
)

export default CreateVpsPage
