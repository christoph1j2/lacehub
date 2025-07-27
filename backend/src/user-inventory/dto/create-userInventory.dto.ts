import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUserInventoryDto {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ description: 'The product id' })
    productId: number;

    @IsNotEmpty()
    @ApiProperty({ description: 'The size of the product' })
    size: string;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ description: 'The quantity of the product' })
    quantity: number;
}
