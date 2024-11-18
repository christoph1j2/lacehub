import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateUserInventoryDto {
    @IsOptional()
    @IsNumber()
    userId?: number;

    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @IsNotEmpty()
    size: string;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;
}
