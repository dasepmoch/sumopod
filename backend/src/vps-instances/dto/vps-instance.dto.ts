import {
    IsDateString,
    IsEnum,
    IsIP,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
} from 'class-validator'
import { Transform } from 'class-transformer'
import { VpsStatus } from '@prisma/client'

const HOSTNAME_PATTERN =
    /^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

const trimString = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value

export class ProvisionVpsFromOrderDto {
    @Transform(trimString)
    @IsString()
    @IsNotEmpty()
    @MaxLength(253)
    @Matches(HOSTNAME_PATTERN, {
        message:
            'hostname must contain valid dot-separated labels using letters, numbers, and internal hyphens',
    })
    hostname: string

    @Transform(trimString)
    @IsString()
    @IsNotEmpty()
    @IsIP()
    ipAddress: string

    @Transform(trimString)
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    os: string

    @Transform(trimString)
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    username: string

    @IsOptional()
    @Transform(trimString)
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    password?: string

    @IsOptional()
    @IsDateString()
    expiresAt?: string
}

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
