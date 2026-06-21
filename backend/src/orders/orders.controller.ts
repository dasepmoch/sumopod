import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { OrdersService } from './orders.service'
import { CreateOrderDto } from './dto/order.dto'
import { PurchaseOrderDto } from './dto/purchase-order.dto'

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
    constructor(private service: OrdersService) {}

    @Post('purchase')
    @Roles(Role.USER)
    purchase(@CurrentUser('id') userId: number, @Body() dto: PurchaseOrderDto) {
        return this.service.purchase(userId, dto)
    }

    @Post()
    create(@CurrentUser('id') userId: number, @Body() dto: CreateOrderDto) {
        return this.service.create(userId, dto)
    }

    @Get('my')
    findMy(@CurrentUser('id') userId: number) {
        return this.service.findMy(userId)
    }

    @Get(':id')
    findOne(
        @CurrentUser('id') userId: number,
        @CurrentUser('role') role: string,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.service.findOne(userId, role, id)
    }
}

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminOrdersController {
    constructor(private service: OrdersService) {}

    @Get()
    findAll() {
        return this.service.findAllAdmin()
    }

    @Patch(':id/approve')
    approve(@Param('id', ParseIntPipe) id: number) {
        return this.service.approve(id)
    }

    @Patch(':id/cancel')
    cancel(@Param('id', ParseIntPipe) id: number) {
        return this.service.cancel(id)
    }
}
