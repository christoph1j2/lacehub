import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'The sku of the product' })
    readonly sku?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'The name of the product' })
    readonly name?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'The description of the product' })
    readonly description?: string;

    @IsOptional()
    @IsUrl()
    @ApiProperty({ description: 'The image link of the product' })
    readonly image_link?: string;
}
