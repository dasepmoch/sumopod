export type Wallet = {
    id: number
    userId: number
    balance: string | number
    currency: string
    createdAt: string
    updatedAt: string
}

export type AdminWalletUser = {
    id: number
    name: string
    email: string
    role: 'USER'
    wallet: Pick<Wallet, 'balance' | 'currency' | 'updatedAt'> | null
}

export type AdminWalletCreditResponse = {
    wallet: Wallet
    transaction: {
        id: number
        userId: number
        walletId: number
        amount: string | number
        description?: string | null
        createdAt: string
    }
}
