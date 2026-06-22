import ApiService from './ApiService'
import type {
    AdminWalletCreditResponse,
    AdminWalletUser,
    Wallet,
} from '@/@types/wallet'

export function apiGetMyWallet() {
    return ApiService.fetchDataWithAxios<Wallet>({
        url: '/wallet/me',
        method: 'get',
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
