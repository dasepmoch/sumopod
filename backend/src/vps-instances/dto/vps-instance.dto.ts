import {
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
} from 'class-validator'
import { VpsStatus } from '@prisma/client'

export class UpdateVpsInstanceDto {
    @IsOptional()
    @IsString()
    ipAddress?: string

    @IsOptional()
    @IsString()
    username?: string

    @IsOptional()
    @IsString()
    password?: string

    @IsOptional()
    @IsString()
    operatingSystem?: string

    @IsOptional()
    @IsDateString()
    expiredAt?: string

    @IsOptional()
    @IsEnum(VpsStatus)
    status?: VpsStatus
}

export class UpdateVpsStatusDto {
    @IsEnum(VpsStatus)
    status: VpsStatus
}
