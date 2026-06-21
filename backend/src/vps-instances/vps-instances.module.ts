import { Module } from '@nestjs/common'
import { ProvidersModule } from '../providers/providers.module'
import {
    AdminVpsInstancesController,
    VpsInstancesController,
} from './vps-instances.controller'
import { VpsInstancesService } from './vps-instances.service'

@Module({
    imports: [ProvidersModule],
    controllers: [VpsInstancesController, AdminVpsInstancesController],
    providers: [VpsInstancesService],
})
export class VpsInstancesModule {}
