import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateReviewDto {
    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({ description: 'The rating of the review' })
    rating: boolean;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'The text of the review' })
    reviewText: string;
}
