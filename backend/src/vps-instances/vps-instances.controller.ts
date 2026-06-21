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
import { VpsInstancesService } from './vps-instances.service'
import {
    UpdateVpsInstanceDto,
    UpdateVpsStatusDto,
} from './dto/vps-instance.dto'

@Controller('vps')
@UseGuards(JwtAuthGuard)
export class VpsInstancesController {
    constructor(private service: VpsInstancesService) {}

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

@Controller('admin/vps')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminVpsInstancesController {
    constructor(private service: VpsInstancesService) {}

    @Get()
    findAll() {
        return this.service.findAllAdmin()
    }

    @Post('from-order/:orderId')
    createFromOrder(@Param('orderId', ParseIntPipe) orderId: number) {
        return this.service.createFromOrder(orderId)
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateVpsInstanceDto,
    ) {
        return this.service.update(id, dto)
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateVpsStatusDto,
    ) {
        return this.service.updateStatus(id, dto)
    }
}
