import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateReviewDto {
    @IsBoolean()
    @IsNotEmpty()
    rating: boolean;

    @IsString()
    @IsNotEmpty()
    reviewText: string;
}
