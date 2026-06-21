import { IsInt, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateOrderDto {
    @IsInt()
    productId: number

    @IsString()
    @MinLength(1)
    vpsName: string

    @IsOptional()
    @IsString()
    selectedOs?: string
}
