import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class UpdateWTSDto {
    @IsString()
    @ApiProperty({ description: 'The size of the product' })
    size?: string;

    @IsNumber()
    @ApiProperty({ description: 'The quantity of the product' })
    quantity?: number;
}
