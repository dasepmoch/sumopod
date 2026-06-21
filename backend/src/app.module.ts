import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { ProductsModule } from './products/products.module'
import { ProviderAccountsModule } from './provider-accounts/provider-accounts.module'
import { OrdersModule } from './orders/orders.module'
import { VpsInstancesModule } from './vps-instances/vps-instances.module'
import { ProvidersModule } from './providers/providers.module'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        AuthModule,
        ProductsModule,
        ProviderAccountsModule,
        OrdersModule,
        VpsInstancesModule,
        ProvidersModule,
    ],
})
export class AppModule {}
