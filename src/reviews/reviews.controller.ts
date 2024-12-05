import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review } from '../entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @Post(':sellerId')
    async create(
        @Param('sellerId') sellerId: number,
        @Request() req,
        @Body() createReviewDto: CreateReviewDto,
    ): Promise<Review> {
        const reviewerId = req.user.id;
        const { rating, reviewText } = createReviewDto;
        return this.reviewsService.create(
            reviewerId,
            sellerId,
            rating,
            reviewText,
        );
    }

    @Get(':sellerId')
    async findAllForSeller(
        @Param('sellerId') sellerId: number,
    ): Promise<Review[]> {
        return this.reviewsService.findAllForSeller(sellerId);
    }

    @Roles('admin')
    @Get('review/:id')
    async findOne(@Param('id') id: number): Promise<Review> {
        return this.reviewsService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') reviewId: number, @Request() req) {
        const userId = req.user.id;
        return this.reviewsService.delete(reviewId, userId);
    }

    @Delete('admin/:id')
    @Roles('admin')
    async deleteAdmin(@Param('id') reviewId: number) {
        const isAdmin = true;
        return this.reviewsService.delete(reviewId, null, isAdmin);
    }
}
