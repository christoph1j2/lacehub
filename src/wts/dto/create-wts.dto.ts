import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateWTSDto {
    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @IsNotEmpty()
    size: string;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;
}
//* fetch product via id, but only because the user will search for it by name/sku through frontend
