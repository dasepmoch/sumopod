'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Spinner from '@/components/ui/Spinner'
import Tag from '@/components/ui/Tag'
import { apiGetMyWallet } from '@/services/WalletService'
import { apiGetProducts, apiPurchaseOrder } from '@/services/VpsService'
import { formatIDR } from '../../_shared/statusHelpers'
import type { Product } from '@/@types/vps'
import type { Wallet } from '@/@types/wallet'

const HOSTNAME_PATTERN =
    /^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

const getOsOptions = (osOptions?: string | null) =>
    osOptions
        ?.split(',')
        .map((option) => option.trim())
        .filter(Boolean) ?? []

const toMinorUnits = (value: string | number) => {
    const normalized = String(value).trim()
    const match = normalized.match(/^(\d+)(?:\.(\d{1,2}))?$/)
    if (!match) return null

    const fraction = (match[2] ?? '').padEnd(2, '0')
    return `${match[1]}${fraction}`.replace(/^0+(?=\d)/, '')
}

const isLessThan = (left: string, right: string) =>
    left.length !== right.length ? left.length < right.length : left < right

const getErrorMessage = (error: unknown) => {
    const message = (
        error as {
            response?: {
                data?: {
                    message?: string | string[]
                }
            }
        }
    ).response?.data?.message

    if (Array.isArray(message)) return message.join(', ')
    return message || 'Unable to complete the purchase.'
}

const CreateVpsPage = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [loading, setLoading] = useState(true)
    const [productError, setProductError] = useState(false)
    const [walletError, setWalletError] = useState(false)
    const [selectedProductId, setSelectedProductId] = useState<number | null>(
        null,
    )
    const [hostname, setHostname] = useState('')
    const [selectedOs, setSelectedOs] = useState('')
    const [purchasing, setPurchasing] = useState(false)
    const [purchaseError, setPurchaseError] = useState('')
    const [purchaseSucceeded, setPurchaseSucceeded] = useState(false)

    const loadPage = useCallback(async () => {
        setLoading(true)
        setProductError(false)
        setWalletError(false)

        const [productsResult, walletResult] = await Promise.allSettled([
            apiGetProducts(),
            apiGetMyWallet(),
        ])

        if (productsResult.status === 'fulfilled') {
            setProducts(
                productsResult.value.filter((product) => product.isActive),
            )
        } else {
            setProducts([])
            setProductError(true)
        }

        if (walletResult.status === 'fulfilled') {
            setWallet(walletResult.value)
        } else {
            setWallet(null)
            setWalletError(true)
        }

        setLoading(false)
    }, [])

    useEffect(() => {
        loadPage()
    }, [loadPage])

    const selectedProduct = useMemo(
        () =>
            products.find((product) => product.id === selectedProductId) ??
            null,
        [products, selectedProductId],
    )
    const osOptions = useMemo(
        () => getOsOptions(selectedProduct?.osOptions),
        [selectedProduct],
    )
    const hostnameValid = HOSTNAME_PATTERN.test(hostname)
    const walletAmount = wallet ? toMinorUnits(wallet.balance) : null
    const productAmount = selectedProduct
        ? toMinorUnits(selectedProduct.priceMonthly)
        : null
    const insufficientBalance =
        walletAmount !== null &&
        productAmount !== null &&
        isLessThan(walletAmount, productAmount)
    const canPurchase =
        Boolean(selectedProduct) &&
        hostnameValid &&
        Boolean(selectedOs) &&
        !insufficientBalance &&
        !purchasing

    const selectProduct = (product: Product) => {
        setSelectedProductId(product.id)
        setSelectedOs('')
        setPurchaseError('')
        setPurchaseSucceeded(false)
    }

    const purchase = async () => {
        if (!selectedProduct || !canPurchase) return

        setPurchasing(true)
        setPurchaseError('')
        setPurchaseSucceeded(false)

        try {
            const result = await apiPurchaseOrder({
                productId: selectedProduct.id,
                hostname,
                os: selectedOs,
            })
            setWallet(result.wallet)
            setPurchaseSucceeded(true)
        } catch (error) {
            setPurchaseError(getErrorMessage(error))
        } finally {
            setPurchasing(false)
        }
    }

    return (
        <div>
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <h3 className="mb-1">Create VPS</h3>
                    <p className="text-gray-500">
                        Choose a VPS plan and pay directly from your wallet.
                    </p>
                </div>
                <Card className="sm:min-w-64">
                    <span className="text-sm text-gray-500">
                        Wallet balance
                    </span>
                    <h4 className="mt-1">
                        {wallet ? formatIDR(wallet.balance) : 'Unavailable'}
                    </h4>
                </Card>
            </div>

            {walletError && (
                <Alert className="mb-4" type="warning" showIcon>
                    Wallet balance could not be loaded. The backend will still
                    validate your balance before purchase.
                </Alert>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Spinner size={40} />
                </div>
            ) : productError ? (
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
                            <Button onClick={loadPage}>Try again</Button>
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
                <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                selected={product.id === selectedProductId}
                                onSelect={() => selectProduct(product)}
                            />
                        ))}
                    </div>

                    <Card className="mt-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div>
                                <h4 className="mb-4">VPS configuration</h4>
                                <FormItem
                                    label="Hostname"
                                    asterisk
                                    invalid={
                                        hostname.length > 0 && !hostnameValid
                                    }
                                    errorMessage="Use valid dot-separated labels with letters, numbers, and internal hyphens."
                                >
                                    <Input
                                        value={hostname}
                                        placeholder="my-server"
                                        maxLength={253}
                                        onChange={(event) => {
                                            setHostname(event.target.value)
                                            setPurchaseError('')
                                            setPurchaseSucceeded(false)
                                        }}
                                    />
                                </FormItem>
                                <FormItem label="Operating system" asterisk>
                                    <Select<{
                                        value: string
                                        label: string
                                    }>
                                        isDisabled={!selectedProduct}
                                        placeholder={
                                            selectedProduct
                                                ? 'Select operating system'
                                                : 'Select a plan first'
                                        }
                                        options={osOptions.map((option) => ({
                                            value: option,
                                            label: option,
                                        }))}
                                        value={
                                            selectedOs
                                                ? {
                                                      value: selectedOs,
                                                      label: selectedOs,
                                                  }
                                                : null
                                        }
                                        onChange={(option) => {
                                            setSelectedOs(option?.value ?? '')
                                            setPurchaseError('')
                                            setPurchaseSucceeded(false)
                                        }}
                                    />
                                </FormItem>
                            </div>

                            <div>
                                <h4 className="mb-4">Order summary</h4>
                                {selectedProduct ? (
                                    <dl className="mb-5 space-y-3">
                                        <SummaryRow
                                            label="Plan"
                                            value={selectedProduct.name}
                                        />
                                        <SummaryRow
                                            label="Hostname"
                                            value={hostname || '-'}
                                        />
                                        <SummaryRow
                                            label="Operating system"
                                            value={selectedOs || '-'}
                                        />
                                        <SummaryRow
                                            label="Monthly price"
                                            value={formatIDR(
                                                selectedProduct.priceMonthly,
                                            )}
                                        />
                                        <SummaryRow
                                            label="Wallet balance"
                                            value={
                                                wallet
                                                    ? formatIDR(wallet.balance)
                                                    : 'Unavailable'
                                            }
                                        />
                                    </dl>
                                ) : (
                                    <p className="mb-5 text-gray-500">
                                        Select a VPS plan to continue.
                                    </p>
                                )}

                                {insufficientBalance && (
                                    <Alert
                                        className="mb-4"
                                        type="warning"
                                        showIcon
                                    >
                                        Insufficient wallet balance for this
                                        plan.
                                    </Alert>
                                )}
                                {purchaseError && (
                                    <Alert
                                        className="mb-4"
                                        type="danger"
                                        showIcon
                                    >
                                        {purchaseError}
                                    </Alert>
                                )}
                                {purchaseSucceeded && (
                                    <Alert
                                        className="mb-4"
                                        type="success"
                                        showIcon
                                    >
                                        Purchase successful. Your VPS is paid
                                        and waiting for provisioning.
                                    </Alert>
                                )}

                                <Button
                                    block
                                    variant="solid"
                                    disabled={!canPurchase}
                                    aria-disabled={!canPurchase}
                                    loading={purchasing}
                                    onClick={purchase}
                                >
                                    Purchase with wallet balance
                                </Button>
                            </div>
                        </div>
                    </Card>
                </>
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
            className={`h-full ${selected ? 'ring-2 ring-primary' : ''}`}
            bodyClass="flex h-full flex-col"
            footer={{
                content: (
                    <Button
                        block
                        active={selected}
                        variant={selected ? 'solid' : 'default'}
                        aria-pressed={selected}
                        onClick={onSelect}
                    >
                        {selected ? 'Selected' : 'Select Plan'}
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

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-start justify-between gap-4">
        <dt className="text-gray-500">{label}</dt>
        <dd className="text-right font-semibold heading-text">{value}</dd>
    </div>
)

export default CreateVpsPage
