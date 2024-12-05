import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { Review } from '../entities/review.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { User } from '../entities/user.entity';

describe('ReviewsService', () => {
    let service: ReviewsService;
    let repository: Repository<Review>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
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

        service = module.get<ReviewsService>(ReviewsService);
        repository = module.get<Repository<Review>>(getRepositoryToken(Review));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('delete', () => {
        it('should delete the review if the user is the reviewer', async () => {
            const review = new Review();
            review.id = 1;
            review.reviewerId = 1;
            review.sellerId = 2;

            const findOneSpy = jest
                .spyOn(repository, 'findOne')
                .mockResolvedValue(review);
            const deleteSpy = jest
                .spyOn(repository, 'delete')
                .mockResolvedValue({ affected: 1, raw: {} });

            await service.delete(1, 1); // User 1 deletes their review

            expect(findOneSpy).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(deleteSpy).toHaveBeenCalledWith(1);
        });

        it('should throw a NotFoundException if review does not exist', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(service.delete(1, 1)).rejects.toThrowError(
                NotFoundException,
            );
        });

        it('should throw a ForbiddenException if the user is not the reviewer', async () => {
            const review = new Review();
            review.id = 1;
            review.reviewerId = 2; // Different user

            jest.spyOn(repository, 'findOne').mockResolvedValue(review);

            await expect(service.delete(1, 1)).rejects.toThrowError(
                ForbiddenException,
            );
        });

        it('should allow admin to delete any review', async () => {
            const review = new Review();
            review.id = 1;
            review.reviewerId = 1;

            jest.spyOn(repository, 'findOne').mockResolvedValue(review);
            const deleteSpy = jest
                .spyOn(repository, 'delete')
                .mockResolvedValue({ affected: 1, raw: {} });

            await service.delete(1, 1, true); // Admin deletes any review

            expect(deleteSpy).toHaveBeenCalledWith(1);
        });
    });
});
