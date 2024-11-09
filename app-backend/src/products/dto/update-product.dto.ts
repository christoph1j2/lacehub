import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    readonly sku?: string;

    @IsOptional()
    @IsString()
    readonly name?: string;

    @IsOptional()
    @IsString()
    readonly description?: string;

    @IsOptional()
    @IsUrl()
    readonly image_link?: string;
}
