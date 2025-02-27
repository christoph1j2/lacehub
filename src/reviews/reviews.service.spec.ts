import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ReviewsService } from './reviews.service';
import { Review } from '../entities/review.entity';
import { User } from '../entities/user.entity';

describe('ReviewsService', () => {
    let service: ReviewsService;
    let reviewRepository: jest.Mocked<Repository<Review>>;
    let userRepository: jest.Mocked<Repository<User>>;

    const mockReviewRepository = () => ({
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        delete: jest.fn(),
    });

    const mockUserRepository = () => ({
        findOne: jest.fn(),
        save: jest.fn(),
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReviewsService,
                {
                    provide: getRepositoryToken(Review),
                    useFactory: mockReviewRepository,
                },
                {
                    provide: getRepositoryToken(User),
                    useFactory: mockUserRepository,
                },
            ],
        }).compile();

        service = module.get<ReviewsService>(ReviewsService);
        reviewRepository = module.get(
            getRepositoryToken(Review),
        ) as jest.Mocked<Repository<Review>>;
        userRepository = module.get(getRepositoryToken(User)) as jest.Mocked<
            Repository<User>
        >;
    });

    describe('create', () => {
        it('should create a new review and update seller credibility score for positive review', async () => {
            // Arrange
            const reviewerId = 1;
            const sellerId = 2;
            const rating = true; // positive review
            const reviewText = 'Great seller!';

            const reviewer = { id: reviewerId } as User;
            const seller = {
                id: sellerId,
                credibility_score: 5,
            } as User;
            const mockReview = {
                id: 1,
                reviewerId,
                sellerId,
                rating,
                review_text: reviewText,
                createdAt: expect.any(Date),
            } as Review;

            userRepository.findOne.mockImplementation(async (options: any) => {
                const id = options.where.id;
                if (id === reviewerId) return reviewer;
                if (id === sellerId) return seller;
                return null;
            });

            reviewRepository.create.mockReturnValue(mockReview);
            reviewRepository.save.mockResolvedValue(mockReview);
            userRepository.save.mockResolvedValue({
                ...seller,
                credibility_score: 6,
            } as User);

            // Act
            const result = await service.create(
                reviewerId,
                sellerId,
                rating,
                reviewText,
            );

            // Assert
            expect(userRepository.findOne).toHaveBeenCalledTimes(2);
            expect(reviewRepository.create).toHaveBeenCalledWith({
                reviewerId,
                sellerId,
                rating,
                review_text: reviewText,
                createdAt: expect.any(Date),
            });
            expect(reviewRepository.save).toHaveBeenCalledWith(mockReview);
            expect(userRepository.save).toHaveBeenCalledWith({
                ...seller,
                credibility_score: 6, // Increased by 1
            });
            expect(result).toEqual(mockReview);
        });

        it('should create a new review and update seller credibility score for negative review', async () => {
            // Arrange
            const reviewerId = 1;
            const sellerId = 2;
            const rating = false; // negative review
            const reviewText = 'Not a good experience';

            const reviewer = { id: reviewerId } as User;
            const seller = {
                id: sellerId,
                credibility_score: 5,
            } as User;
            const mockReview = {
                id: 1,
                reviewerId,
                sellerId,
                rating,
                review_text: reviewText,
                createdAt: expect.any(Date),
            } as Review;

            userRepository.findOne.mockImplementation(async (options: any) => {
                const id = options.where.id;
                if (id === reviewerId) return reviewer;
                if (id === sellerId) return seller;
                return null;
            });

            reviewRepository.create.mockReturnValue(mockReview);
            reviewRepository.save.mockResolvedValue(mockReview);
            userRepository.save.mockResolvedValue({
                ...seller,
                credibility_score: 4,
            } as User);

            // Act
            const result = await service.create(
                reviewerId,
                sellerId,
                rating,
                reviewText,
            );

            // Assert
            expect(userRepository.save).toHaveBeenCalledWith({
                ...seller,
                credibility_score: 4, // Decreased by 1
            });
            expect(result).toEqual(mockReview);
        });

        it('should initialize credibility score if it is null', async () => {
            // Arrange
            const reviewerId = 1;
            const sellerId = 2;
            const rating = true;
            const reviewText = 'Great seller!';

            const reviewer = { id: reviewerId } as User;
            const seller = {
                id: sellerId,
                credibility_score: null,
            } as User;
            const mockReview = {
                id: 1,
                reviewerId,
                sellerId,
                rating,
                review_text: reviewText,
                createdAt: expect.any(Date),
            } as Review;

            userRepository.findOne.mockImplementation(async (options: any) => {
                const id = options.where.id;
                if (id === reviewerId) return reviewer;
                if (id === sellerId) return seller;
                return null;
            });

            reviewRepository.create.mockReturnValue(mockReview);
            reviewRepository.save.mockResolvedValue(mockReview);

            // Act
            await service.create(reviewerId, sellerId, rating, reviewText);

            // Assert
            expect(userRepository.save).toHaveBeenCalledWith({
                ...seller,
                credibility_score: 1, // Initialized to 0 and increased by 1
            });
        });

        it('should throw BadRequestException if user tries to review themselves', async () => {
            // Arrange
            const userId = 1;

            // Act & Assert
            await expect(
                service.create(userId, userId, true, 'Self review'),
            ).rejects.toThrow(BadRequestException);
            expect(reviewRepository.create).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException if reviewer does not exist', async () => {
            // Arrange
            const reviewerId = 1;
            const sellerId = 2;
            userRepository.findOne.mockImplementation(async (options: any) => {
                const id = options.where.id;
                if (id === reviewerId) return null;
                return { id: sellerId } as User;
            });

            // Act & Assert
            await expect(
                service.create(reviewerId, sellerId, true, 'Good seller'),
            ).rejects.toThrow(BadRequestException);
            expect(reviewRepository.create).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException if seller does not exist', async () => {
            // Arrange
            const reviewerId = 1;
            const sellerId = 2;
            userRepository.findOne.mockImplementation(async (options: any) => {
                const id = options.where.id;
                if (id === reviewerId) return { id: reviewerId } as User;
                return null;
            });

            // Act & Assert
            await expect(
                service.create(reviewerId, sellerId, true, 'Good seller'),
            ).rejects.toThrow(BadRequestException);
            expect(reviewRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('findAllForSeller', () => {
        it('should return all reviews for a specific seller', async () => {
            // Arrange
            const sellerId = 1;
            const mockReviews = [
                { id: 1, sellerId, rating: true },
                { id: 2, sellerId, rating: false },
            ] as Review[];
            reviewRepository.find.mockResolvedValue(mockReviews);

            // Act
            const result = await service.findAllForSeller(sellerId);

            // Assert
            expect(reviewRepository.find).toHaveBeenCalledWith({
                where: { sellerId },
                relations: ['reviewer'],
            });
            expect(result).toEqual(mockReviews);
        });

        it('should return empty array if seller has no reviews', async () => {
            // Arrange
            const sellerId = 1;
            reviewRepository.find.mockResolvedValue([]);

            // Act
            const result = await service.findAllForSeller(sellerId);

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a review by id', async () => {
            // Arrange
            const reviewId = 1;
            const mockReview = {
                id: reviewId,
                reviewerId: 2,
                sellerId: 3,
            } as Review;
            reviewRepository.findOne.mockResolvedValue(mockReview);

            // Act
            const result = await service.findOne(reviewId);

            // Assert
            expect(reviewRepository.findOne).toHaveBeenCalledWith({
                where: { id: reviewId },
                relations: ['reviewer', 'seller'],
            });
            expect(result).toEqual(mockReview);
        });

        it('should throw NotFoundException if review does not exist', async () => {
            // Arrange
            const reviewId = 999;
            reviewRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findOne(reviewId)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('delete', () => {
        it('should delete a review and decrement credibility score for positive review', async () => {
            // Arrange
            const reviewId = 1;
            const userId = 2;
            const sellerId = 3;
            const mockReview = {
                id: reviewId,
                reviewerId: userId,
                sellerId,
                rating: true, // positive review
            } as Review;
            const seller = {
                id: sellerId,
                credibility_score: 10,
            } as User;

            reviewRepository.findOne.mockResolvedValue(mockReview);
            userRepository.findOne.mockResolvedValue(seller);

            // Act
            await service.delete(reviewId, userId);

            // Assert
            expect(reviewRepository.findOne).toHaveBeenCalledWith({
                where: { id: reviewId },
                relations: ['seller'],
            });
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: sellerId },
            });
            expect(userRepository.save).toHaveBeenCalledWith({
                ...seller,
                credibility_score: 9, // Decreased by 1 because positive review was deleted
            });
            expect(reviewRepository.delete).toHaveBeenCalledWith(reviewId);
        });

        it('should delete a review and increment credibility score for negative review', async () => {
            // Arrange
            const reviewId = 1;
            const userId = 2;
            const sellerId = 3;
            const mockReview = {
                id: reviewId,
                reviewerId: userId,
                sellerId,
                rating: false, // negative review
            } as Review;
            const seller = {
                id: sellerId,
                credibility_score: 5,
            } as User;

            reviewRepository.findOne.mockResolvedValue(mockReview);
            userRepository.findOne.mockResolvedValue(seller);

            // Act
            await service.delete(reviewId, userId);

            // Assert
            expect(userRepository.save).toHaveBeenCalledWith({
                ...seller,
                credibility_score: 6, // Increased by 1 because negative review was deleted
            });
            expect(reviewRepository.delete).toHaveBeenCalledWith(reviewId);
        });

        it('should allow admin to delete any review', async () => {
            // Arrange
            const reviewId = 1;
            const adminId = 99;
            const reviewerId = 2;
            const sellerId = 3;
            const mockReview = {
                id: reviewId,
                reviewerId,
                sellerId,
                rating: true,
            } as Review;
            const seller = {
                id: sellerId,
                credibility_score: 10,
            } as User;

            reviewRepository.findOne.mockResolvedValue(mockReview);
            userRepository.findOne.mockResolvedValue(seller);

            // Act
            await service.delete(reviewId, adminId, true); // Admin = true

            // Assert
            expect(reviewRepository.delete).toHaveBeenCalledWith(reviewId);
        });

        it("should throw ForbiddenException if non-admin tries to delete another user's review", async () => {
            // Arrange
            const reviewId = 1;
            const userId = 99;
            const reviewerId = 2; // Different from userId
            const mockReview = {
                id: reviewId,
                reviewerId,
                sellerId: 3,
                rating: true,
            } as Review;

            reviewRepository.findOne.mockResolvedValue(mockReview);

            // Act & Assert
            await expect(service.delete(reviewId, userId)).rejects.toThrow(
                ForbiddenException,
            );
            expect(reviewRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if review does not exist', async () => {
            // Arrange
            const reviewId = 999;
            const userId = 1;
            reviewRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.delete(reviewId, userId)).rejects.toThrow(
                NotFoundException,
            );
            expect(reviewRepository.delete).not.toHaveBeenCalled();
        });

        it('should handle case where seller no longer exists', async () => {
            // Arrange
            const reviewId = 1;
            const userId = 2;
            const sellerId = 3;
            const mockReview = {
                id: reviewId,
                reviewerId: userId,
                sellerId,
                rating: true,
            } as Review;

            reviewRepository.findOne.mockResolvedValue(mockReview);
            userRepository.findOne.mockResolvedValue(null); // Seller doesn't exist

            // Act
            await service.delete(reviewId, userId);

            // Assert
            expect(userRepository.save).not.toHaveBeenCalled(); // Shouldn't try to update non-existent seller
            expect(reviewRepository.delete).toHaveBeenCalledWith(reviewId);
        });
    });
});
