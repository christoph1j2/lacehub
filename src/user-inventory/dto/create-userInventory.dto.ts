import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUserInventoryDto {
    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @IsNotEmpty()
    size: string;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;
}
