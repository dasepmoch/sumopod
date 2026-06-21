import { Module } from '@nestjs/common'
import { ManualAdapter } from './manual.adapter'
import { TencentAdapter } from './tencent.adapter'
import { AlibabaAdapter } from './alibaba.adapter'
import { CloudekaAdapter } from './cloudeka.adapter'
import { ProvidersService } from './providers.service'

@Module({
    providers: [
        ManualAdapter,
        TencentAdapter,
        AlibabaAdapter,
        CloudekaAdapter,
        ProvidersService,
    ],
    exports: [ProvidersService],
})
export class ProvidersModule {}
