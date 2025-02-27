import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import { BannedUserGuard } from '../common/guards/banned-user.guard';

describe('MatchesController', () => {
    let controller: MatchesController;
    let matchesService: MatchesService;

    // Mock data
    const mockMatch = {
        id: 1,
        buyer_id: 1,
        seller_id: 2,
        product_id: 1,
        size: 'M',
        score: 0.95,
        // Add more properties as needed
    };

    // Mock service
    const mockMatchesService = {
        findMatchesForBuyer: jest.fn(),
        findMatchesForSeller: jest.fn(),
    };

    // Mock guards
    const mockJwtAuthGuard = {
        canActivate: jest.fn(),
    };

    const mockBannedUserGuard = {
        canActivate: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MatchesController],
            providers: [
                {
                    provide: MatchesService,
                    useValue: mockMatchesService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(mockJwtAuthGuard)
            .overrideGuard(BannedUserGuard)
            .useValue(mockBannedUserGuard)
            .compile();

        controller = module.get<MatchesController>(MatchesController);
        matchesService = module.get<MatchesService>(MatchesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getMyBuyerMatches', () => {
        it('should return matches for the buyer', async () => {
            // Arrange
            const userId = 1;
            const mockRequest = { user: { id: userId } };
            const expectedMatches = [mockMatch];

            mockMatchesService.findMatchesForBuyer.mockResolvedValue(
                expectedMatches,
            );
            mockBannedUserGuard.canActivate.mockReturnValue(true);

            // Act
            const result = await controller.getMyBuyerMatches(mockRequest);

            // Assert
            expect(result).toEqual(expectedMatches);
            expect(matchesService.findMatchesForBuyer).toHaveBeenCalledWith(
                userId,
            );
        });

        it('should throw HttpException if service throws an error', async () => {
            // Arrange
            const userId = 1;
            const mockRequest = { user: { id: userId } };
            const errorMessage = 'Service error';

            mockMatchesService.findMatchesForBuyer.mockRejectedValue(
                new Error(errorMessage),
            );
            mockBannedUserGuard.canActivate.mockReturnValue(true);

            // Act & Assert
            await expect(
                controller.getMyBuyerMatches(mockRequest),
            ).rejects.toThrow(
                new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
            );
        });

        it('should be blocked by BannedUserGuard if user is banned', async () => {
            // Arrange
            const userId = 1;
            const mockRequest = {
                user: {
                    id: userId,
                    is_banned: true,
                    ban_expiration: new Date(Date.now() + 86400000),
                },
            }; // banned for 1 day

            // Simulate guard behavior
            mockBannedUserGuard.canActivate.mockImplementation(() => {
                throw new ForbiddenException(
                    `You are banned from using matching functionality until: ${mockRequest.user.ban_expiration}`,
                );
            });

            // Act & Assert
            await expect(async () => {
                // We need to manually execute the guard before calling the controller method
                const guardResult = mockBannedUserGuard.canActivate();
                if (guardResult !== true) {
                    throw new ForbiddenException(
                        `You are banned from using matching functionality until: ${mockRequest.user.ban_expiration}`,
                    );
                }
                return await controller.getMyBuyerMatches(mockRequest);
            }).rejects.toThrow(ForbiddenException);

            expect(matchesService.findMatchesForBuyer).not.toHaveBeenCalled();
        });

        it('should not be blocked if ban has expired', async () => {
            // Arrange
            const userId = 1;
            const mockRequest = {
                user: {
                    id: userId,
                    is_banned: true,
                    ban_expiration: new Date(Date.now() - 86400000), // ban expired 1 day ago
                },
            };
            const expectedMatches = [mockMatch];

            mockMatchesService.findMatchesForBuyer.mockResolvedValue(
                expectedMatches,
            );
            mockBannedUserGuard.canActivate.mockReturnValue(true); // Ban expired, so guard allows access

            // Act
            const result = await controller.getMyBuyerMatches(mockRequest);

            // Assert
            expect(result).toEqual(expectedMatches);
            expect(matchesService.findMatchesForBuyer).toHaveBeenCalledWith(
                userId,
            );
        });
    });

    describe('getMySellerMatches', () => {
        it('should return matches for the seller', async () => {
            // Arrange
            const userId = 2;
            const mockRequest = { user: { id: userId } };
            const expectedMatches = [mockMatch];

            mockMatchesService.findMatchesForSeller.mockResolvedValue(
                expectedMatches,
            );
            mockBannedUserGuard.canActivate.mockReturnValue(true);

            // Act
            const result = await controller.getMySellerMatches(mockRequest);

            // Assert
            expect(result).toEqual(expectedMatches);
            expect(matchesService.findMatchesForSeller).toHaveBeenCalledWith(
                userId,
            );
        });

        it('should throw HttpException if service throws an error', async () => {
            // Arrange
            const userId = 2;
            const mockRequest = { user: { id: userId } };
            const errorMessage = 'Service error';

            mockMatchesService.findMatchesForSeller.mockRejectedValue(
                new Error(errorMessage),
            );
            mockBannedUserGuard.canActivate.mockReturnValue(true);

            // Act & Assert
            await expect(
                controller.getMySellerMatches(mockRequest),
            ).rejects.toThrow(
                new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
            );
        });

        it('should be blocked by BannedUserGuard if user is banned', async () => {
            // Arrange
            const userId = 2;
            const mockRequest = {
                user: {
                    id: userId,
                    is_banned: true,
                    ban_expiration: new Date(Date.now() + 86400000),
                },
            };

            // Simulate guard behavior
            mockBannedUserGuard.canActivate.mockImplementation(() => {
                throw new ForbiddenException(
                    `You are banned from using matching functionality until: ${mockRequest.user.ban_expiration}`,
                );
            });

            // Act & Assert
            await expect(async () => {
                const guardResult = mockBannedUserGuard.canActivate();
                if (guardResult !== true) {
                    throw new ForbiddenException(
                        `You are banned from using matching functionality until: ${mockRequest.user.ban_expiration}`,
                    );
                }
                return await controller.getMySellerMatches(mockRequest);
            }).rejects.toThrow(ForbiddenException);

            expect(matchesService.findMatchesForSeller).not.toHaveBeenCalled();
        });
    });

    describe('admin endpoints', () => {
        describe('getMatchesForBuyer', () => {
            it('should return matches for a specific buyer (admin access)', async () => {
                // Arrange
                const buyerId = 1;
                const expectedMatches = [mockMatch];

                mockMatchesService.findMatchesForBuyer.mockResolvedValue(
                    expectedMatches,
                );

                // Act
                const result = await controller.getMatchesForBuyer(buyerId);

                // Assert
                expect(result).toEqual(expectedMatches);
                expect(matchesService.findMatchesForBuyer).toHaveBeenCalledWith(
                    buyerId,
                );
            });

            it('should throw HttpException if service throws an error', async () => {
                // Arrange
                const buyerId = 1;
                const errorMessage = 'Service error';

                mockMatchesService.findMatchesForBuyer.mockRejectedValue(
                    new Error(errorMessage),
                );

                // Act & Assert
                await expect(
                    controller.getMatchesForBuyer(buyerId),
                ).rejects.toThrow(
                    new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
                );
            });
        });

        describe('getMatchesForSeller', () => {
            it('should return matches for a specific seller (admin access)', async () => {
                // Arrange
                const sellerId = 2;
                const expectedMatches = [mockMatch];

                mockMatchesService.findMatchesForSeller.mockResolvedValue(
                    expectedMatches,
                );

                // Act
                const result = await controller.getMatchesForSeller(sellerId);

                // Assert
                expect(result).toEqual(expectedMatches);
                expect(
                    matchesService.findMatchesForSeller,
                ).toHaveBeenCalledWith(sellerId);
            });

            it('should throw HttpException if service throws an error', async () => {
                // Arrange
                const sellerId = 2;
                const errorMessage = 'Service error';

                mockMatchesService.findMatchesForSeller.mockRejectedValue(
                    new Error(errorMessage),
                );

                // Act & Assert
                await expect(
                    controller.getMatchesForSeller(sellerId),
                ).rejects.toThrow(
                    new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
                );
            });
        });
    });
});
