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

/**
 * Service responsible for managing user reviews and credibility scores
 * Handles CRUD operations for reviews and updates seller credibility scores
 */
@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    /**
     * Creates a new review and updates the seller's credibility score
     *
     * @param reviewerId - The ID of the user creating the review
     * @param sellerId - The ID of the seller being reviewed
     * @param rating - Boolean indicating whether the review is positive (true) or negative (false)
     * @param reviewText - The textual content of the review
     * @returns The newly created review entity
     * @throws BadRequestException if a user tries to review themselves or if users aren't found
     */
    async create(
        reviewerId: number,
        sellerId: number,
        rating: boolean,
        reviewText: string,
    ): Promise<Review> {
        // Prevent self-reviews to maintain system integrity
        if (reviewerId === sellerId) {
            throw new BadRequestException('You cannot review yourself');
        }

        // Retrieve both users to verify they exist
        const reviewer = await this.userRepository.findOne({
            where: { id: reviewerId },
        });
        const seller = await this.userRepository.findOne({
            where: { id: sellerId },
        });

        // Validate that both users exist in the system
        if (!reviewer || !seller) {
            throw new BadRequestException('User not found');
        }

        // Create a new review object with the provided data
        const review = this.reviewRepository.create({
            reviewerId,
            sellerId,
            rating,
            review_text: reviewText,
            createdAt: new Date(),
        });

        // Save the review to the database first
        const savedReview = await this.reviewRepository.save(review);

        // Calculate credibility score adjustment based on review rating:
        // - Positive review (rating = true): +1 to credibility score
        // - Negative review (rating = false): -1 to credibility score
        const scoreChange = rating ? 1 : -1;

        // Update the seller's credibility score
        // The || 0 ensures we handle cases where credibility_score might be null
        seller.credibility_score =
            (seller.credibility_score || 0) + scoreChange;

        // Save the seller with the updated credibility score
        await this.userRepository.save(seller);

        return savedReview;
    }

    /**
     * Retrieves all reviews for a specific seller
     *
     * @param sellerId - The ID of the seller whose reviews to retrieve
     * @returns An array of Review entities including reviewer information
     */
    async findAllForSeller(sellerId: number): Promise<Review[]> {
        return this.reviewRepository.find({
            where: { sellerId },
            relations: ['reviewer'],
        });
    }

    /**
     * Finds a specific review by its ID
     *
     * @param id - The ID of the review to find
     * @returns The Review entity with related reviewer and seller information
     * @throws NotFoundException if the review doesn't exist
     */
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

    /**
     * Deletes a review and reverts its effect on the seller's credibility score
     *
     * @param reviewId - The ID of the review to delete
     * @param userId - The ID of the user attempting to delete the review
     * @param isAdmin - Boolean indicating if the user has admin privileges
     * @throws NotFoundException if the review doesn't exist
     * @throws ForbiddenException if a non-admin user tries to delete someone else's review
     */
    async delete(
        reviewId: number,
        userId: number,
        isAdmin: boolean = false,
    ): Promise<void> {
        // Find the review to be deleted, including seller information
        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
            relations: ['seller'],
        });

        // Check if the review exists
        if (!review) {
            throw new NotFoundException(
                `Review with ID ${reviewId} not found.`,
            );
        }

        // Ensure only the author or an admin can delete the review
        if (!isAdmin && review.reviewerId !== userId) {
            throw new ForbiddenException(
                'You can only delete your own reviews.',
            );
        }

        // Find the seller to update their credibility score
        const seller = await this.userRepository.findOne({
            where: { id: review.sellerId },
        });

        // Revert the credibility score effect of this review being deleted:
        // - If it was a positive review (rating = true): -1 to credibility score
        // - If it was a negative review (rating = false): +1 to credibility score
        if (seller) {
            // Reverse the original score change
            const scoreChange = review.rating ? -1 : 1;

            // Update the credibility score
            // The || 0 handles potential null values
            seller.credibility_score =
                (seller.credibility_score || 0) + scoreChange;

            // Save the updated seller record
            await this.userRepository.save(seller);
        }

        // Delete the review from the database
        await this.reviewRepository.delete(reviewId);
    }
}
