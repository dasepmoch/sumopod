import {
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator'

export class CreditWalletDto {
    @IsInt()
    @Min(1)
    @Max(Number.MAX_SAFE_INTEGER)
    amount: number

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string
}
