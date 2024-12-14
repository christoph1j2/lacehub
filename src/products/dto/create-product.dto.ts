import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'The sku of the product' })
    readonly sku: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'The name of the product' })
    readonly name: string;

    @IsString()
    @ApiProperty({ description: 'The description of the product' })
    readonly description: string;

    @IsNotEmpty()
    @IsUrl()
    @ApiProperty({ description: 'The image link of the product' })
    readonly image_link: string;
}
