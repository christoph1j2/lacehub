import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Review } from '../entities/review.entity';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

describe('ReviewsController', () => {
    let controller: ReviewsController;
    let service: ReviewsService;

    const mockUser = { id: 1, role: 'user' };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReviewsController],
            providers: [
                ReviewsService,
                {
                    provide: getRepositoryToken(Review),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                },
            ],
        }).compile();

        controller = module.get<ReviewsController>(ReviewsController);
        service = module.get<ReviewsService>(ReviewsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('delete', () => {
        it('should allow the user to delete their own review', async () => {
            const reviewId = 1;
            jest.spyOn(service, 'delete').mockResolvedValue(undefined);

            await controller.delete(reviewId, { user: mockUser });

            expect(service.delete).toHaveBeenCalledWith(reviewId, mockUser.id);
        });

        it('should throw NotFoundException when the review does not exist', async () => {
            const reviewId = 1;
            jest.spyOn(service, 'delete').mockRejectedValue(
                new NotFoundException(),
            );

            await expect(
                controller.delete(reviewId, { user: mockUser }),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when the user tries to delete a review they did not write', async () => {
            const reviewId = 1;
            jest.spyOn(service, 'delete').mockRejectedValue(
                new ForbiddenException(),
            );

            await expect(
                controller.delete(reviewId, { user: mockUser }),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should allow an admin to delete any review', async () => {
            const reviewId = 1;
            jest.spyOn(service, 'delete').mockResolvedValue(undefined);

            await controller.deleteAdmin(reviewId);

            expect(service.delete).toHaveBeenCalledWith(reviewId, null, true);
        });
    });
});
