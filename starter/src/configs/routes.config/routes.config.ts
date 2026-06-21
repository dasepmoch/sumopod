import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'

const pageMeta = {
    pageBackgroundType: 'plain' as const,
    pageContainerType: 'contained' as const,
}

export const protectedRoutes: Routes = {
    '/dashboard': {
        key: 'dashboard',
        authority: [],
        meta: pageMeta,
    },
    '/dashboard/create-vps': {
        key: 'dashboard.createVps',
        authority: [],
        meta: pageMeta,
    },
    '/dashboard/vps': {
        key: 'dashboard.vps',
        authority: [],
        meta: pageMeta,
    },
    '/admin': {
        key: 'admin',
        authority: ['ADMIN'],
        meta: pageMeta,
    },
    '/admin/products': {
        key: 'admin.products',
        authority: ['ADMIN'],
        meta: pageMeta,
    },
    '/admin/provider-accounts': {
        key: 'admin.providerAccounts',
        authority: ['ADMIN'],
        meta: pageMeta,
    },
    '/admin/orders': {
        key: 'admin.orders',
        authority: ['ADMIN'],
        meta: pageMeta,
    },
    '/admin/vps': {
        key: 'admin.vps',
        authority: ['ADMIN'],
        meta: pageMeta,
    },
}

export const publicRoutes: Routes = {}

export const authRoutes = authRoute
