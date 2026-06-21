import ApiService from './ApiService'
import type {
    AdminProduct,
    Order,
    Product,
    ProviderAccount,
    VpsInstance,
    VpsStatus,
} from '@/@types/vps'

// ---------- Products (public/user) ----------
export function apiGetProducts() {
    return ApiService.fetchDataWithAxios<Product[]>({
        url: '/products',
        method: 'get',
    })
}

export function apiGetProduct(id: number | string) {
    return ApiService.fetchDataWithAxios<Product>({
        url: `/products/${id}`,
        method: 'get',
    })
}

// ---------- Orders (user) ----------
export function apiCreateOrder(data: {
    productId: number
    vpsName: string
    selectedOs?: string
}) {
    return ApiService.fetchDataWithAxios<Order>({
        url: '/orders',
        method: 'post',
        data,
    })
}

export function apiGetMyOrders() {
    return ApiService.fetchDataWithAxios<Order[]>({
        url: '/orders/my',
        method: 'get',
    })
}

// ---------- VPS (user) ----------
export function apiGetMyVps() {
    return ApiService.fetchDataWithAxios<VpsInstance[]>({
        url: '/vps/my',
        method: 'get',
    })
}

export function apiGetVps(id: number | string) {
    return ApiService.fetchDataWithAxios<VpsInstance>({
        url: `/vps/${id}`,
        method: 'get',
    })
}

// ---------- Admin: Products ----------
export function apiAdminGetProducts() {
    return ApiService.fetchDataWithAxios<AdminProduct[]>({
        url: '/admin/products',
        method: 'get',
    })
}

export function apiAdminCreateProduct(data: Record<string, unknown>) {
    return ApiService.fetchDataWithAxios<AdminProduct>({
        url: '/admin/products',
        method: 'post',
        data,
    })
}

export function apiAdminUpdateProduct(
    id: number,
    data: Record<string, unknown>,
) {
    return ApiService.fetchDataWithAxios<AdminProduct>({
        url: `/admin/products/${id}`,
        method: 'patch',
        data,
    })
}

export function apiAdminDeleteProduct(id: number) {
    return ApiService.fetchDataWithAxios({
        url: `/admin/products/${id}`,
        method: 'delete',
    })
}

// ---------- Admin: Provider accounts ----------
export function apiAdminGetProviderAccounts() {
    return ApiService.fetchDataWithAxios<ProviderAccount[]>({
        url: '/admin/provider-accounts',
        method: 'get',
    })
}

export function apiAdminCreateProviderAccount(data: Record<string, unknown>) {
    return ApiService.fetchDataWithAxios<ProviderAccount>({
        url: '/admin/provider-accounts',
        method: 'post',
        data,
    })
}

export function apiAdminUpdateProviderAccount(
    id: number,
    data: Record<string, unknown>,
) {
    return ApiService.fetchDataWithAxios<ProviderAccount>({
        url: `/admin/provider-accounts/${id}`,
        method: 'patch',
        data,
    })
}

export function apiAdminDeleteProviderAccount(id: number) {
    return ApiService.fetchDataWithAxios({
        url: `/admin/provider-accounts/${id}`,
        method: 'delete',
    })
}

// ---------- Admin: Orders ----------
export function apiAdminGetOrders() {
    return ApiService.fetchDataWithAxios<Order[]>({
        url: '/admin/orders',
        method: 'get',
    })
}

export function apiAdminApproveOrder(id: number) {
    return ApiService.fetchDataWithAxios<Order>({
        url: `/admin/orders/${id}/approve`,
        method: 'patch',
    })
}

export function apiAdminCancelOrder(id: number) {
    return ApiService.fetchDataWithAxios<Order>({
        url: `/admin/orders/${id}/cancel`,
        method: 'patch',
    })
}

// ---------- Admin: VPS ----------
export function apiAdminGetVps() {
    return ApiService.fetchDataWithAxios<VpsInstance[]>({
        url: '/admin/vps',
        method: 'get',
    })
}

export function apiAdminCreateVpsFromOrder(orderId: number) {
    return ApiService.fetchDataWithAxios<VpsInstance>({
        url: `/admin/vps/from-order/${orderId}`,
        method: 'post',
    })
}

export function apiAdminUpdateVps(id: number, data: Record<string, unknown>) {
    return ApiService.fetchDataWithAxios<VpsInstance>({
        url: `/admin/vps/${id}`,
        method: 'patch',
        data,
    })
}

export function apiAdminUpdateVpsStatus(id: number, status: VpsStatus) {
    return ApiService.fetchDataWithAxios<VpsInstance>({
        url: `/admin/vps/${id}/status`,
        method: 'patch',
        data: { status },
    })
}
