import { Module } from '@nestjs/common'
import {
    AdminVpsInstancesController,
    VpsInstancesController,
} from './vps-instances.controller'
import { VpsInstancesService } from './vps-instances.service'

@Module({
    controllers: [VpsInstancesController, AdminVpsInstancesController],
    providers: [VpsInstancesService],
})
export class VpsInstancesModule {}
