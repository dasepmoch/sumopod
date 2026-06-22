import ApiService from './ApiService'
import type {
    AdminWalletCreditResponse,
    AdminWalletTransaction,
    AdminWalletUser,
    UserWalletTransaction,
    Wallet,
    WalletTransactionDirection,
} from '@/@types/wallet'

export function apiGetMyWallet() {
    return ApiService.fetchDataWithAxios<Wallet>({
        url: '/wallet/me',
        method: 'get',
    })
}

export function apiGetMyWalletTransactions(params?: {
    direction?: WalletTransactionDirection
    limit?: number
}) {
    return ApiService.fetchDataWithAxios<UserWalletTransaction[]>({
        url: '/wallet/transactions',
        method: 'get',
        params,
    })
}

export function apiAdminGetWalletUsers() {
    return ApiService.fetchDataWithAxios<AdminWalletUser[]>({
        url: '/admin/wallets',
        method: 'get',
    })
}

export function apiAdminCreditWallet(
    userId: number,
    data: { amount: number; description?: string },
) {
    return ApiService.fetchDataWithAxios<AdminWalletCreditResponse>({
        url: `/admin/wallets/${userId}/credit`,
        method: 'post',
        data,
    })
}

export function apiAdminGetWalletTransactions(params?: {
    userId?: number
    direction?: WalletTransactionDirection
    search?: string
    limit?: number
}) {
    return ApiService.fetchDataWithAxios<AdminWalletTransaction[]>({
        url: '/admin/wallets/transactions',
        method: 'get',
        params,
    })
}
