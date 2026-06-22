import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CreditWalletDto } from './dto/credit-wallet.dto'
import { MyWalletTransactionsQueryDto } from './dto/my-wallet-transactions-query.dto'
import { WalletTransactionsQueryDto } from './dto/wallet-transactions-query.dto'
import { WalletService } from './wallet.service'

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
    constructor(private service: WalletService) {}

    @Get('me')
    findMine(@CurrentUser('id') userId: number) {
        return this.service.findMine(userId)
    }

    @Get(['transactions', 'transactions/my'])
    findMyTransactions(
        @CurrentUser('id') userId: number,
        @Query() query: MyWalletTransactionsQueryDto,
    ) {
        return this.service.findMyTransactions(userId, query)
    }
}

@Controller('admin/wallets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminWalletController {
    constructor(private service: WalletService) {}

    @Get()
    findUsers() {
        return this.service.findUsers()
    }

    @Get('transactions')
    findTransactions(@Query() query: WalletTransactionsQueryDto) {
        return this.service.findTransactions(query)
    }

    @Post(':userId/credit')
    credit(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() dto: CreditWalletDto,
    ) {
        return this.service.credit(userId, dto)
    }
}
