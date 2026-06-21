import { Injectable } from '@nestjs/common'
import {
    CreateVpsPayload,
    CreateVpsResult,
    ProviderAdapter,
} from './provider-adapter.interface'

/**
 * Manual adapter. No external API call.
 * The admin will input IP / username / password / expired date manually
 * after the VPS instance is created from an order.
 */
@Injectable()
export class ManualAdapter implements ProviderAdapter {
    async createVps(_payload: CreateVpsPayload): Promise<CreateVpsResult> {
        // Nothing to provision automatically. Returns empty result so the
        // VPS stays in "provisioning" status until admin fills the details.
        return {}
    }
}
