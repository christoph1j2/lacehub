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

    @Post(':sellerId')
    @ApiBearerAuth()
    @ApiOperation({
        summary:
            'Create a review, sellerId as param, reviewerId from token, review from body',
    })
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
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get all reviews for a seller, displayed on user profile',
    })
    async findAllForSeller(
        @Param('sellerId') sellerId: number,
    ): Promise<Review[]> {
        return this.reviewsService.findAllForSeller(sellerId);
    }

    @Roles('admin')
    @Get('review/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a review by ID, only for admin' })
    async findOne(@Param('id') id: number): Promise<Review> {
        return this.reviewsService.findOne(id);
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
