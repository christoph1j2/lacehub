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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @Post(':sellerId')
    @ApiOperation({ summary: 'Create a review' })
    @ApiResponse({ status: 201, description: 'Review created' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
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
    @ApiOperation({ summary: 'Get all reviews for a seller' })
    @ApiResponse({ status: 200, description: 'Reviews found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Seller not found' })
    async findAllForSeller(
        @Param('sellerId') sellerId: number,
    ): Promise<Review[]> {
        return this.reviewsService.findAllForSeller(sellerId);
    }

    @Roles('admin')
    @Get('review/:id')
    @ApiOperation({ summary: 'Get a review by ID' })
    @ApiResponse({ status: 200, description: 'Review found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    async findOne(@Param('id') id: number): Promise<Review> {
        return this.reviewsService.findOne(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a review' })
    @ApiResponse({ status: 200, description: 'Review deleted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    async delete(@Param('id') reviewId: number, @Request() req) {
        const userId = req.user.id;
        return this.reviewsService.delete(reviewId, userId);
    }

    @Delete('admin/:id')
    @Roles('admin')
    @ApiOperation({ summary: 'Delete a review by admin' })
    @ApiResponse({ status: 200, description: 'Review deleted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    async deleteAdmin(@Param('id') reviewId: number) {
        const isAdmin = true;
        return this.reviewsService.delete(reviewId, null, isAdmin);
    }
}
