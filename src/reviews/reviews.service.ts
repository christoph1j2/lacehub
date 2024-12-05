import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from '../entities/review.entity';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(
        reviewerId: number,
        sellerId: number,
        rating: boolean,
        reviewText: string,
    ): Promise<Review> {
        if (reviewerId === sellerId) {
            throw new BadRequestException('You cannot review yourself');
        }

        const reviewer = await this.userRepository.findOne({
            where: { id: reviewerId },
        });
        const seller = await this.userRepository.findOne({
            where: { id: sellerId },
        });

        if (!reviewer || !seller) {
            throw new BadRequestException('User not found');
        }

        const review = this.reviewRepository.create({
            reviewerId,
            sellerId,
            rating,
            review_text: reviewText,
            createdAt: new Date(),
        });

        return this.reviewRepository.save(review);
    }

    async findAllForSeller(sellerId: number): Promise<Review[]> {
        return this.reviewRepository.find({
            where: { sellerId },
            relations: ['reviewer'],
        });
    }

    async findOne(id: number): Promise<Review> {
        const review = await this.reviewRepository.findOne({
            where: { id },
            relations: ['reviewer', 'seller'],
        });
        if (!review) {
            throw new NotFoundException(`Review with ID ${id} not found`);
        }
        return review;
    }

    async delete(
        reviewId: number,
        userId: number,
        isAdmin: boolean = false,
    ): Promise<void> {
        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
        });

        if (!review) {
            throw new NotFoundException(
                `Review with ID ${reviewId} not found.`,
            );
        }

        if (!isAdmin && review.reviewerId !== userId) {
            throw new ForbiddenException(
                'You can only delete your own reviews.',
            );
        }

        await this.reviewRepository.delete(reviewId);
    }
}
