import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UpdateWTBDto {
    @IsString()
    @ApiProperty({ description: 'The size of the product' })
    size?: string;

    @IsNumber()
    @ApiProperty({ description: 'The quantity of the product' })
    quantity?: number;
}
