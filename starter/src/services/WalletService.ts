import ApiService from './ApiService'
import type { Wallet } from '@/@types/wallet'

export function apiGetMyWallet() {
    return ApiService.fetchDataWithAxios<Wallet>({
        url: '/wallet/me',
        method: 'get',
    })
}
