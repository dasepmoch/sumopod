import {
    IsInt,
    IsString,
    Matches,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator'

const HOSTNAME_PATTERN =
    /^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

export class PurchaseOrderDto {
    @IsInt()
    @Min(1)
    productId: number

    @IsString()
    @MinLength(1)
    @MaxLength(253)
    @Matches(HOSTNAME_PATTERN, {
        message:
            'hostname must contain valid dot-separated labels using letters, numbers, and internal hyphens',
    })
    hostname: string

    @IsString()
    @MinLength(1)
    @MaxLength(100)
    os: string
}
