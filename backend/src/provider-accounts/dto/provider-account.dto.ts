import {
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator'
import { Provider } from '@prisma/client'

export class CreateProviderAccountDto {
    @IsString()
    @MinLength(2)
    name: string

    @IsEnum(Provider)
    provider: Provider

    @IsOptional()
    @IsString()
    apiKey?: string

    @IsOptional()
    @IsString()
    apiSecret?: string

    @IsOptional()
    @IsString()
    regionDefault?: string

    @IsOptional()
    @IsBoolean()
    isActive?: boolean
}

export class UpdateProviderAccountDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string

    @IsOptional()
    @IsEnum(Provider)
    provider?: Provider

    @IsOptional()
    @IsString()
    apiKey?: string

    @IsOptional()
    @IsString()
    apiSecret?: string

    @IsOptional()
    @IsString()
    regionDefault?: string

    @IsOptional()
    @IsBoolean()
    isActive?: boolean
}
