import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    readonly sku: string;

    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    readonly description: string;

    @IsNotEmpty()
    @IsUrl()
    readonly image_link: string;
}
