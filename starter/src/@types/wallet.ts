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

export type WalletTransactionDirection = 'CREDIT' | 'DEBIT'

export type UserWalletTransaction = {
    id: number
    walletId: number
    direction: WalletTransactionDirection
    amount: string | number
    currency: string
    description?: string | null
    createdAt: string
}

export type WalletTransactionType =
    | 'TOPUP'
    | 'PURCHASE'
    | 'REFUND'
    | 'ADJUSTMENT'

export type AdminWalletTransaction = {
    id: number
    userId: number
    user: {
        name: string
        email: string
    }
    walletId: number
    type: WalletTransactionType
    direction: WalletTransactionDirection
    amount: string | number
    currency: string
    description?: string | null
    referenceType?: string | null
    referenceId?: string | null
    createdAt: string
}
