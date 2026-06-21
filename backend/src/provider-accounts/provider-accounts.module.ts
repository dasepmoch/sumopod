import { Module } from '@nestjs/common'
import { ProviderAccountsController } from './provider-accounts.controller'
import { ProviderAccountsService } from './provider-accounts.service'

@Module({
    controllers: [ProviderAccountsController],
    providers: [ProviderAccountsService],
})
export class ProviderAccountsModule {}
