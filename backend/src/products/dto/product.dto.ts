import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    MinLength,
} from 'class-validator'
import { Provider, ProvisioningType } from '@prisma/client'

export class CreateProductDto {
    @IsString()
    @MinLength(2)
    name: string

    @IsInt()
    providerAccountId: number

    @IsEnum(Provider)
    provider: Provider

    @IsOptional()
    @IsString()
    region?: string

    @IsInt()
    @Min(1)
    cpu: number

    @IsInt()
    @Min(1)
    ram: number

    @IsInt()
    @Min(1)
    storage: number

    @IsOptional()
    @IsString()
    bandwidth?: string

    @IsOptional()
    @IsString()
    transfer?: string

    @IsNumber()
    @Min(0)
    priceMonthly: number

    @IsOptional()
    @IsNumber()
    @Min(0)
    costMonthly?: number

    @IsOptional()
    @IsString()
    osOptions?: string

    @IsOptional()
    @IsEnum(ProvisioningType)
    provisioningType?: ProvisioningType

    @IsOptional()
    @IsBoolean()
    isActive?: boolean
}

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string

    @IsOptional()
    @IsInt()
    providerAccountId?: number

    @IsOptional()
    @IsEnum(Provider)
    provider?: Provider

    @IsOptional()
    @IsString()
    region?: string

    @IsOptional()
    @IsInt()
    @Min(1)
    cpu?: number

    @IsOptional()
    @IsInt()
    @Min(1)
    ram?: number

    @IsOptional()
    @IsInt()
    @Min(1)
    storage?: number

    @IsOptional()
    @IsString()
    bandwidth?: string

    @IsOptional()
    @IsString()
    transfer?: string

    @IsOptional()
    @IsNumber()
    @Min(0)
    priceMonthly?: number

    @IsOptional()
    @IsNumber()
    @Min(0)
    costMonthly?: number

    @IsOptional()
    @IsString()
    osOptions?: string

    @IsOptional()
    @IsEnum(ProvisioningType)
    provisioningType?: ProvisioningType

    @IsOptional()
    @IsBoolean()
    isActive?: boolean
}
