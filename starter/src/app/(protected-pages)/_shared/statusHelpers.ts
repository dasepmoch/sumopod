import type { OrderStatus, VpsStatus } from '@/@types/vps'

export const orderStatusColor: Record<OrderStatus, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100',
    approved: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-100',
    provisioning:
        'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-100',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-100',
}

export const vpsStatusColor: Record<VpsStatus, string> = {
    provisioning:
        'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-100',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100',
    suspended:
        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100',
    expired: 'bg-gray-200 text-gray-700 dark:bg-gray-500/20 dark:text-gray-100',
    terminated: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-100',
}

export function formatIDR(value: string | number) {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (Number.isNaN(num)) return '-'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num)
}

export function formatDate(value?: string | null) {
    if (!value) return '-'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return '-'
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(d)
}
