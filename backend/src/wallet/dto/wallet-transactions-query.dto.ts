import { Type } from 'class-transformer'
import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator'
import { WalletTransactionDirection } from '@prisma/client'

export class WalletTransactionsQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    userId?: number

    @IsOptional()
    @IsEnum(WalletTransactionDirection)
    direction?: WalletTransactionDirection

    @IsOptional()
    @IsString()
    @MaxLength(255)
    search?: string

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number
}
