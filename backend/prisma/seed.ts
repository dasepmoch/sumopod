import { PrismaClient, Provider, ProvisioningType, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('password123', 10)

    // ---- Users ----
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            name: 'Admin',
            email: 'admin@example.com',
            password,
            role: Role.ADMIN,
        },
    })

    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            name: 'Demo User',
            email: 'user@example.com',
            password,
            role: Role.USER,
        },
    })

    // ---- Provider account ----
    let tencentAccount = await prisma.providerAccount.findFirst({
        where: { name: 'Tencent Account 1' },
    })
    if (!tencentAccount) {
        tencentAccount = await prisma.providerAccount.create({
            data: {
                name: 'Tencent Account 1',
                provider: Provider.tencent,
                regionDefault: 'Jakarta',
                isActive: true,
            },
        })
    }

    // ---- Products ----
    const products = [
        {
            name: 'Tencent Basic',
            cpu: 2,
            ram: 2,
            storage: 40,
            bandwidth: '20 Mbps',
            transfer: '512 GB',
            priceMonthly: 60000,
            costMonthly: 0,
        },
        {
            name: 'Tencent Standard',
            cpu: 2,
            ram: 2,
            storage: 50,
            bandwidth: '30 Mbps',
            transfer: '1.02 TB',
            priceMonthly: 75000,
            costMonthly: 0,
        },
        {
            name: 'Tencent General',
            cpu: 2,
            ram: 4,
            storage: 60,
            bandwidth: '30 Mbps',
            transfer: '1.54 TB',
            priceMonthly: 90000,
            costMonthly: 0,
        },
    ]

    for (const p of products) {
        const existing = await prisma.product.findFirst({
            where: { name: p.name },
        })
        if (!existing) {
            await prisma.product.create({
                data: {
                    ...p,
                    provider: Provider.tencent,
                    region: 'Jakarta',
                    osOptions: 'Ubuntu 22.04,Debian 12,CentOS 7',
                    provisioningType: ProvisioningType.manual,
                    providerAccountId: tencentAccount.id,
                    isActive: true,
                },
            })
        }
    }

    // eslint-disable-next-line no-console
    console.log('Seed done:', {
        admin: admin.email,
        user: user.email,
        providerAccount: tencentAccount.name,
        products: products.length,
    })
}

main()
    .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
