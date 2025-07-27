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
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @Post(':seller_id')
    @ApiBearerAuth()
    @ApiOperation({
        summary:
            'Create a review, seller_id as param, reviewer_id from token, review from body',
    })
    @ApiResponse({ status: 201, description: 'Review created' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async create(
        @Param('seller_id') seller_id: number,
        @Request() req,
        @Body() createReviewDto: CreateReviewDto,
    ): Promise<Review> {
        const reviewer_id = req.user.id;
        const { rating, reviewText } = createReviewDto;
        return this.reviewsService.create(
            reviewer_id,
            seller_id,
            rating,
            reviewText,
        );
    }

    @Get(':seller_id')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get all reviews for a seller, displayed on user profile',
    })
    async findAllForSeller(
        @Param('seller_id') seller_id: number,
    ): Promise<any[]> {
        const reviews = await this.reviewsService.findAllForSeller(seller_id);
        return reviews.map((review) => ({
            reviewer: review.reviewer.username,
            rating: review.rating,
            reviewText: review.review_text,
            createdAt: review.created_at.toISOString().split('T')[0],
        }));
    }

    @Roles('admin')
    @Get('review/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a review by ID, only for admin' })
    async findOne(@Param('id') id: number): Promise<Review> {
        return this.reviewsService.findOne(id);
    }

    @Roles('admin')
    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all reviews, only for admin' })
    async findAll(): Promise<Review[]> {
        return this.reviewsService.findAll();
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete users own posted review' })
    async delete(@Param('id') reviewId: number, @Request() req) {
        const userId = req.user.id;
        return this.reviewsService.delete(reviewId, userId);
    }

    @Delete('admin/:id')
    @ApiBearerAuth()
    @Roles('admin')
    @ApiOperation({ summary: 'Delete a review by admin' })
    async deleteAdmin(@Param('id') reviewId: number) {
        const isAdmin = true;
        return this.reviewsService.delete(reviewId, null, isAdmin);
    }
}
