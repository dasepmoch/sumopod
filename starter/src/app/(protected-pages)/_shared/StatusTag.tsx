'use client'

import Tag from '@/components/ui/Tag'
import { orderStatusColor, vpsStatusColor } from './statusHelpers'
import type { OrderStatus, VpsStatus } from '@/@types/vps'

export const OrderStatusTag = ({ status }: { status: OrderStatus }) => {
    return (
        <Tag className={`capitalize ${orderStatusColor[status] ?? ''}`}>
            {status}
        </Tag>
    )
}

export const VpsStatusTag = ({ status }: { status: VpsStatus }) => {
    return (
        <Tag className={`capitalize ${vpsStatusColor[status] ?? ''}`}>
            {status}
        </Tag>
    )
}
