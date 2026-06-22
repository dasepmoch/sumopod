export type ProviderName = 'tencent' | 'alibaba' | 'cloudeka' | 'manual'

export type ProvisioningType = 'manual' | 'api' | 'stock'

export type OrderStatus =
    | 'pending'
    | 'paid'
    | 'approved'
    | 'provisioning'
    | 'active'
    | 'cancelled'

export type VpsStatus =
    | 'provisioning'
    | 'active'
    | 'suspended'
    | 'expired'
    | 'terminated'

export type Product = {
    id: number
    name: string
    provider: ProviderName
    region?: string | null
    cpu: number
    ram: number
    storage: number
    bandwidth?: string | null
    transfer?: string | null
    priceMonthly: string | number
    osOptions?: string | null
    provisioningType: ProvisioningType
    isActive: boolean
}

export type AdminProduct = Product & {
    providerAccountId: number
    costMonthly: string | number
    providerAccount?: {
        id: number
        name: string
        provider: ProviderName
    }
}

export type ProviderAccount = {
    id: number
    name: string
    provider: ProviderName
    regionDefault?: string | null
    isActive: boolean
    createdAt?: string
    updatedAt?: string
}

export type Order = {
    id: number
    userId: number
    productId: number
    vpsName: string
    selectedOs?: string | null
    status: OrderStatus
    totalPrice: string | number
    billingCycle: string
    createdAt: string
    product?: { id: number; name: string; provider?: ProviderName }
    user?: { id: number; name: string; email: string }
}

export type PurchaseOrderResponse = {
    order: Order
    wallet: {
        id: number
        userId: number
        balance: string | number
        currency: string
        createdAt: string
        updatedAt: string
    }
}

export type ProvisionVpsFromOrderInput = {
    hostname: string
    ipAddress: string
    os: string
    username: string
    password?: string
    expiresAt?: string
}

export type VpsInstance = {
    id: number
    userId: number
    orderId?: number | null
    productId: number
    providerAccountId?: number | null
    vpsName: string
    provider: ProviderName
    region?: string | null
    operatingSystem?: string | null
    cpu: number
    ram: number
    storage: number
    bandwidth?: string | null
    transfer?: string | null
    ipAddress?: string | null
    username?: string | null
    password?: string | null
    status: VpsStatus
    expiredAt?: string | null
    createdAt: string
    updatedAt?: string
    product?: { id: number; name: string }
    user?: { id: number; name: string; email: string }
}
