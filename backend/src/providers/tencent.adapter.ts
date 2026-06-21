import { Injectable, NotImplementedException } from '@nestjs/common'
import {
    CreateVpsPayload,
    CreateVpsResult,
    ProviderAdapter,
} from './provider-adapter.interface'

/** Placeholder. Production API integration is out of MVP scope. */
@Injectable()
export class TencentAdapter implements ProviderAdapter {
    async createVps(_payload: CreateVpsPayload): Promise<CreateVpsResult> {
        throw new NotImplementedException(
            'Tencent API provisioning is not implemented yet',
        )
    }
}
