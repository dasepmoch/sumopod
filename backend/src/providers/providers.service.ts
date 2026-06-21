import { Injectable } from '@nestjs/common'
import { Provider } from '@prisma/client'
import { ManualAdapter } from './manual.adapter'
import { TencentAdapter } from './tencent.adapter'
import { AlibabaAdapter } from './alibaba.adapter'
import { CloudekaAdapter } from './cloudeka.adapter'
import { ProviderAdapter } from './provider-adapter.interface'

@Injectable()
export class ProvidersService {
    constructor(
        private manual: ManualAdapter,
        private tencent: TencentAdapter,
        private alibaba: AlibabaAdapter,
        private cloudeka: CloudekaAdapter,
    ) {}

    getAdapter(provider: Provider): ProviderAdapter {
        switch (provider) {
            case Provider.tencent:
                return this.tencent
            case Provider.alibaba:
                return this.alibaba
            case Provider.cloudeka:
                return this.cloudeka
            case Provider.manual:
            default:
                return this.manual
        }
    }
}
