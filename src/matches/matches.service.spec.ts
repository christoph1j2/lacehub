/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { MatchesService } from './matches.service';
import { User } from '../entities/user.entity';
import { Wtb } from '../entities/wtb.entity';
import { Wts } from '../entities/wts.entity';
import { Match } from '../entities/match.entity';
import { NotificationsService } from '../notifications/notifications.service';

describe('MatchesService', () => {
    let matchesService: MatchesService;
    let userRepository: Repository<User>;
    let wtbRepository: Repository<Wtb>;
    let wtsRepository: Repository<Wts>;
    let matchRepository: Repository<Match>;
    let notificationsService: NotificationsService;

    // Mock repositories and services
    const mockUserRepository = () => ({
        findOne: jest.fn(),
        find: jest.fn(),
    });

    const mockWtbRepository = () => ({
        find: jest.fn(),
    });

    const mockWtsRepository = () => ({
        find: jest.fn(),
    });

    const mockMatchRepository = () => ({
        save: jest.fn(),
    });

    const mockNotificationsService = () => ({
        create: jest.fn().mockResolvedValue(undefined),
    });

    // Setup testing module before each test
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchesService,
                {
                    provide: getRepositoryToken(User),
                    useFactory: mockUserRepository,
                },
                {
                    provide: getRepositoryToken(Wtb),
                    useFactory: mockWtbRepository,
                },
                {
                    provide: getRepositoryToken(Wts),
                    useFactory: mockWtsRepository,
                },
                {
                    provide: getRepositoryToken(Match),
                    useFactory: mockMatchRepository,
                },
                {
                    provide: NotificationsService,
                    useFactory: mockNotificationsService,
                },
            ],
        }).compile();

        matchesService = module.get<MatchesService>(MatchesService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        wtbRepository = module.get<Repository<Wtb>>(getRepositoryToken(Wtb));
        wtsRepository = module.get<Repository<Wts>>(getRepositoryToken(Wts));
        matchRepository = module.get<Repository<Match>>(
            getRepositoryToken(Match),
        );
        notificationsService =
            module.get<NotificationsService>(NotificationsService);
    });

    // Mock data helpers - creates realistic test data
    const createProductMock = (sku: string) => ({
        sku,
        name: `Product ${sku}`,
        brand: 'TestBrand',
    });

    const createUserMock = (id: number, name: string, credibility: number) => ({
        id,
        username: name,
        credibility_score: credibility,
        wtb: [],
        wts: [],
    });

    const createWtbItemMock = (
        id: number,
        sku: string,
        size: string,
        userId: number,
    ) => ({
        id,
        size,
        product: createProductMock(sku),
        user: { id: userId },
    });

    const createWtsItemMock = (
        id: number,
        sku: string,
        size: string,
        userId: number,
    ) => ({
        id,
        size,
        product: createProductMock(sku),
        user: { id: userId },
    });

    describe('findMatchesForBuyer', () => {
        it('should return top 5 matches sorted by match score and credibility', async () => {
            // Create mock buyer with WTB items
            const mockBuyer = createUserMock(1, 'Buyer1', 85);
            mockBuyer.wtb = [
                createWtbItemMock(1, 'SKU001', 'M', 1),
                createWtbItemMock(2, 'SKU002', 'L', 1),
                createWtbItemMock(3, 'SKU003', 'XL', 1),
            ];

            // Create multiple sellers with different matching items
            const mockSeller1 = createUserMock(2, 'Seller1', 90);
            mockSeller1.wts = [
                createWtsItemMock(1, 'SKU001', 'M', 2), // Match
                createWtsItemMock(2, 'SKU004', 'S', 2), // No match
            ];

            const mockSeller2 = createUserMock(3, 'Seller2', 95);
            mockSeller2.wts = [
                createWtsItemMock(3, 'SKU001', 'M', 3), // Match
                createWtsItemMock(4, 'SKU002', 'L', 3), // Match
                createWtsItemMock(5, 'SKU003', 'XL', 3), // Match - 100% match
            ];

            const mockSeller3 = createUserMock(4, 'Seller3', 80);
            mockSeller3.wts = [
                createWtsItemMock(6, 'SKU001', 'M', 4), // Match
                createWtsItemMock(7, 'SKU002', 'L', 4), // Match - 66% match
            ];

            const mockSeller4 = createUserMock(5, 'Seller4', 99);
            mockSeller4.wts = [
                createWtsItemMock(8, 'SKU004', 'S', 5), // No match - 0% match
            ];

            const mockSeller5 = createUserMock(6, 'Seller5', 85);
            mockSeller5.wts = [
                createWtsItemMock(9, 'SKU001', 'S', 6), // No match (wrong size)
            ];

            const mockSeller6 = createUserMock(7, 'Seller6', 88);
            mockSeller6.wts = [
                createWtsItemMock(10, 'SKU001', 'M', 7), // Match - 33% match
            ];

            // Setup mocks
            userRepository.findOne = jest.fn().mockResolvedValue(mockBuyer);
            userRepository.find = jest
                .fn()
                .mockResolvedValue([
                    mockSeller1,
                    mockSeller2,
                    mockSeller3,
                    mockSeller4,
                    mockSeller5,
                    mockSeller6,
                ]);

            // Mock saved matches
            const savedMatchesMock = [
                {
                    id: 1,
                    wtb: mockBuyer.wtb[0],
                    wts: mockSeller1.wts[0],
                    buyer: mockBuyer,
                    seller: mockSeller1,
                    match_score: 1 / 3, // One match out of three items
                    createdAt: expect.any(Date),
                    status: 'pending',
                },
                // More saved matches would be here in real implementation
            ];
            matchRepository.save = jest
                .fn()
                .mockResolvedValue(savedMatchesMock);

            // Call the method
            const result = await matchesService.findMatchesForBuyer(1);

            // Assertions
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['wtb', 'wtb.product'],
            });

            expect(userRepository.find).toHaveBeenCalledWith({
                where: { id: Not(1) },
                relations: ['wts', 'wts.product'],
            });

            // Should return top 5 matches sorted by match score then credibility
            // Should expect 5 matches only if there are at least 5 sellers with matches
            expect(result.length).toBeLessThanOrEqual(5);
            expect(result.length).toBe(4); // 4 sellers have matches in this test case
            expect(result[0].seller.username).toBe('Seller2'); // 100% match, high credibility
            expect(result[1].seller.username).toBe('Seller3'); // 66% match
            expect(result[2].seller.username).toBe('Seller1'); // 33% match
            expect(result[3].seller.username).toBe('Seller6'); // 33% match

            // Match repository should be called with array of matches
            expect(matchRepository.save).toHaveBeenCalled();

            // Notifications should be created for each match
            expect(notificationsService.create).toHaveBeenCalledTimes(
                savedMatchesMock.length,
            );
        });

        it('should handle case when buyer has no WTB items (with find called)', async () => {
            // Create mock buyer with no WTB items
            const mockBuyer = createUserMock(1, 'EmptyBuyer', 80);
            mockBuyer.wtb = [];

            // Setup mocks
            userRepository.findOne = jest.fn().mockResolvedValue(mockBuyer);
            userRepository.find = jest.fn().mockResolvedValue([]);

            // Mock empty saved matches
            matchRepository.save = jest.fn().mockResolvedValue([]);

            // Call the method
            const result = await matchesService.findMatchesForBuyer(1);

            // Assertions
            expect(result).toEqual([]);
            expect(notificationsService.create).not.toHaveBeenCalled();
        });

        it('should handle case when buyer has no WTB items (skipping find)', async () => {
            // Create mock buyer with no WTB items
            const mockBuyer = createUserMock(1, 'EmptyBuyer', 80);
            mockBuyer.wtb = [];

            // Setup mocks
            userRepository.findOne = jest.fn().mockResolvedValue(mockBuyer);

            // Call the method
            const result = await matchesService.findMatchesForBuyer(1);

            // Assertions
            expect(result).toEqual([]);
            expect(userRepository.find).not.toHaveBeenCalled();
            expect(matchRepository.save).not.toHaveBeenCalled();
            expect(notificationsService.create).not.toHaveBeenCalled();
        });

        it('should handle case when buyer does not exist', async () => {
            // Setup mocks to return null (buyer not found)
            userRepository.findOne = jest.fn().mockResolvedValue(null);

            // Call the method
            const result = await matchesService.findMatchesForBuyer(999);

            // Assertions
            expect(result).toEqual([]);
            expect(userRepository.find).not.toHaveBeenCalled();
            expect(matchRepository.save).not.toHaveBeenCalled();
            expect(notificationsService.create).not.toHaveBeenCalled();
        });

        it('should handle case when there are no other sellers', async () => {
            // Create mock buyer with WTB items
            const mockBuyer = createUserMock(1, 'LoneBuyer', 90);
            mockBuyer.wtb = [createWtbItemMock(1, 'SKU001', 'M', 1)];

            // Setup mocks
            userRepository.findOne = jest.fn().mockResolvedValue(mockBuyer);
            userRepository.find = jest.fn().mockResolvedValue([]); // No other users/sellers

            // Call the method
            const result = await matchesService.findMatchesForBuyer(1);

            // Assertions
            expect(result).toEqual([]);
            expect(matchRepository.save).not.toHaveBeenCalled();
            expect(notificationsService.create).not.toHaveBeenCalled();
        });

        it('should handle case when sellers exist but have no WTS items', async () => {
            // Create mock buyer with WTB items
            const mockBuyer = createUserMock(1, 'Buyer', 90);
            mockBuyer.wtb = [createWtbItemMock(1, 'SKU001', 'M', 1)];

            // Create sellers with empty WTS arrays
            const mockSeller1 = createUserMock(2, 'EmptySeller1', 85);
            mockSeller1.wts = [];

            const mockSeller2 = createUserMock(3, 'EmptySeller2', 87);
            mockSeller2.wts = null; // Test null case as well

            // Setup mocks
            userRepository.findOne = jest.fn().mockResolvedValue(mockBuyer);
            userRepository.find = jest
                .fn()
                .mockResolvedValue([mockSeller1, mockSeller2]);

            // Call the method
            const result = await matchesService.findMatchesForBuyer(1);

            // Assertions
            expect(result).toEqual([]);
            expect(matchRepository.save).not.toHaveBeenCalled();
            expect(notificationsService.create).not.toHaveBeenCalled();
        });

        it('should handle case when no sellers match', async () => {
            // Create mock buyer with WTB items
            const mockBuyer = createUserMock(1, 'LonelyBuyer', 90);
            mockBuyer.wtb = [createWtbItemMock(1, 'UniqueItem', 'XS', 1)];

            // Create sellers with no matching items
            const mockSeller = createUserMock(2, 'NoMatchSeller', 85);
            mockSeller.wts = [createWtsItemMock(1, 'DifferentItem', 'L', 2)];

            // Setup mocks
            userRepository.findOne = jest.fn().mockResolvedValue(mockBuyer);
            userRepository.find = jest.fn().mockResolvedValue([mockSeller]);

            // Mock empty saved matches
            matchRepository.save = jest.fn().mockResolvedValue([]);

            // Call the method
            const result = await matchesService.findMatchesForBuyer(1);

            // Assertions
            expect(result).toEqual([]);
            // Since no matches are found, the service might not call save() at all
            expect(matchRepository.save).not.toHaveBeenCalled();
            expect(notificationsService.create).not.toHaveBeenCalled();
        });
    });

    describe('findMatchesForSeller', () => {
        it('should return top 5 matches sorted by match score and credibility', async () => {
            // Create mock seller with WTS items
            const mockSeller = createUserMock(1, 'Seller1', 85);
            mockSeller.wts = [
                createWtsItemMock(1, 'SKU001', 'M', 1),
                createWtsItemMock(2, 'SKU002', 'L', 1),
            ];

            // Create multiple buyers with different matching items
            const mockBuyer1 = createUserMock(2, 'Buyer1', 90);
            mockBuyer1.wtb = [
                createWtbItemMock(1, 'SKU001', 'M', 2), // Match
            ];

            const mockBuyer2 = createUserMock(3, 'Buyer2', 95);
            mockBuyer2.wtb = [
                createWtbItemMock(2, 'SKU001', 'M', 3), // Match
                createWtbItemMock(3, 'SKU002', 'L', 3), // Match - 100% match
            ];

            const mockBuyer3 = createUserMock(4, 'Buyer3', 75);
            mockBuyer3.wtb = [
                createWtbItemMock(4, 'SKU003', 'XL', 4), // No match
            ];

            // Setup mocks
            userRepository.findOne = jest.fn().mockResolvedValue(mockSeller);
            userRepository.find = jest
                .fn()
                .mockResolvedValue([mockBuyer1, mockBuyer2, mockBuyer3]);

            // Mock saved matches
            const savedMatchesMock = [
                {
                    id: 1,
                    wtb: { wtb: mockBuyer1.wtb[0] },
                    wts: { wts: mockSeller.wts[0] },
                    buyer: mockBuyer1,
                    seller: mockSeller,
                    match_score: 0.5, // One match out of two items
                    createdAt: expect.any(Date),
                    status: 'pending',
                },
                // More saved matches would be here in real implementation
            ];
            matchRepository.save = jest
                .fn()
                .mockResolvedValue(savedMatchesMock);

            // Call the method
            const result = await matchesService.findMatchesForSeller(1);

            // Assertions
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['wts', 'wts.product'],
            });

            expect(userRepository.find).toHaveBeenCalledWith({
                where: { id: Not(1) },
                relations: ['wtb', 'wtb.product'],
            });

            // Should return matches (only buyers with actual matches)
            expect(result.length).toBeGreaterThan(0);
            expect(result.length).toBeLessThanOrEqual(5); // Return at most 5 matches
            expect(result[0].buyer.username).toBe('Buyer2'); // 100% match, high credibility
            expect(result[1].buyer.username).toBe('Buyer1'); // 50% match
            // Buyer3 has 0% match so likely isn't included in the results

            // Match repository should be called with array of matches
            expect(matchRepository.save).toHaveBeenCalled();

            // Notifications should be created for each match
            expect(notificationsService.create).toHaveBeenCalledTimes(
                savedMatchesMock.length,
            );
        });

        it('should handle case when seller has no WTS items', async () => {
            // Create mock seller with no WTS items
            const mockSeller = createUserMock(1, 'EmptySeller', 80);
            mockSeller.wts = [];

            // Setup mocks
            userRepository.findOne = jest.fn().mockResolvedValue(mockSeller);
            userRepository.find = jest.fn().mockResolvedValue([]);

            // Mock empty saved matches
            matchRepository.save = jest.fn().mockResolvedValue([]);

            // Call the method
            const result = await matchesService.findMatchesForSeller(1);

            // Assertions for empty results
            expect(result).toEqual([]);
            expect(matchRepository.save).not.toHaveBeenCalled();
            expect(notificationsService.create).not.toHaveBeenCalled();
        });
    });

    // Testing the private method by using a workaround to access it
    describe('calculateOverlap', () => {
        it('should correctly identify overlapping items', () => {
            // Create test data
            const wtbItems = [
                createWtbItemMock(1, 'SKU001', 'M', 1),
                createWtbItemMock(2, 'SKU002', 'L', 1),
                createWtbItemMock(3, 'SKU003', 'XL', 1),
            ];

            const wtsItems = [
                createWtsItemMock(1, 'SKU001', 'M', 2), // Match
                createWtsItemMock(2, 'SKU002', 'L', 2), // Match
                createWtsItemMock(3, 'SKU003', 'S', 2), // No match (different size)
                createWtsItemMock(4, 'SKU004', 'XL', 2), // No match (different SKU)
            ];

            // Access the private method using type casting
            const result = (matchesService as any).calculateOverlap(
                wtbItems,
                wtsItems,
            );

            // Assertions
            expect(result).toHaveLength(2);
            expect(result[0].product.sku).toBe('SKU001');
            expect(result[1].product.sku).toBe('SKU002');
            // Ensure items with different size aren't matched
            expect(
                result.find((item) => item.product.sku === 'SKU003'),
            ).toBeUndefined();
        });

        it('should return empty array when no overlaps exist', () => {
            const wtbItems = [createWtbItemMock(1, 'SKU001', 'M', 1)];

            const wtsItems = [createWtsItemMock(1, 'SKU002', 'L', 2)];

            const result = (matchesService as any).calculateOverlap(
                wtbItems,
                wtsItems,
            );
            expect(result).toEqual([]);
        });

        it('should handle empty input arrays', () => {
            const emptyWtb: Wtb[] = [];
            const emptyWts: Wts[] = [];
            const wtsItems = [createWtsItemMock(1, 'SKU001', 'M', 2)];

            const result1 = (matchesService as any).calculateOverlap(
                emptyWtb,
                wtsItems,
            );
            const result2 = (matchesService as any).calculateOverlap(
                [createWtbItemMock(1, 'SKU001', 'M', 1)],
                emptyWts,
            );
            const result3 = (matchesService as any).calculateOverlap(
                emptyWtb,
                emptyWts,
            );

            expect(result1).toEqual([]);
            expect(result2).toEqual([]);
            expect(result3).toEqual([]);
        });
    });
});
