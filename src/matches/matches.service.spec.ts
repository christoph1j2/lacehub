/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Wtb } from '../entities/wtb.entity';
import { Wts } from '../entities/wts.entity';
import { Match } from '../entities/match.entity';
import { Product } from '../entities/product.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Repository } from 'typeorm';

describe('MatchesService', () => {
    let matchesService: MatchesService;
    let userRepository: Repository<User>;
    let wtbRepository: Repository<Wtb>;
    let wtsRepository: Repository<Wts>;
    let matchRepository: Repository<Match>;
    let notificationsService: NotificationsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchesService,
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(Wtb),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(Wts),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(Match),
                    useValue: {
                        save: jest.fn().mockResolvedValue([]), // Mock save method
                    },
                },
                {
                    provide: NotificationsService,
                    useValue: {
                        create: jest.fn(),
                    },
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

    describe('findMatchesForBuyer', () => {
        it('should handle large and complex match scenarios', async () => {
            const buyerId = 1;

            // Create a more extensive set of products
            const products = [
                { sku: 'SHOE001', name: 'Running Shoes' },
                { sku: 'SHOE002', name: 'Hiking Boots' },
                { sku: 'SHOE003', name: 'Casual Sneakers' },
                { sku: 'SHOE004', name: 'Basketball Shoes' },
                { sku: 'SHOE005', name: 'Soccer Cleats' },
                { sku: 'SHOE006', name: 'Tennis Shoes' },
            ].map((p) => ({ sku: p.sku, name: p.name }) as Product);

            // Buyer's wish to buy (WTB) list with multiple items
            const mockBuyer = {
                id: buyerId,
                wtb: [
                    { product: products[0], size: '10', quantity: 2 } as Wtb,
                    { product: products[1], size: '11', quantity: 1 } as Wtb,
                    { product: products[2], size: '9', quantity: 3 } as Wtb,
                    { product: products[3], size: '12', quantity: 1 } as Wtb,
                ],
            } as User;

            // Multiple sellers with varying product overlaps
            const mockSellers = [
                {
                    id: 2,
                    username: 'Seller1',
                    credibility_score: 4.7,
                    wts: [
                        {
                            product: products[0],
                            size: '10',
                            quantity: 3,
                        } as Wts,
                        {
                            product: products[1],
                            size: '11',
                            quantity: 2,
                        } as Wts,
                        { product: products[5], size: '9', quantity: 1 } as Wts,
                    ],
                },
                {
                    id: 3,
                    username: 'Seller2',
                    credibility_score: 4.5,
                    wts: [
                        { product: products[2], size: '9', quantity: 4 } as Wts,
                        {
                            product: products[3],
                            size: '12',
                            quantity: 2,
                        } as Wts,
                    ],
                },
                {
                    id: 4,
                    username: 'Seller3',
                    credibility_score: 3.9,
                    wts: [
                        {
                            product: products[0],
                            size: '10',
                            quantity: 1,
                        } as Wts,
                        {
                            product: products[4],
                            size: '10',
                            quantity: 3,
                        } as Wts,
                    ],
                },
                {
                    id: 5,
                    username: 'Seller4',
                    credibility_score: 3.7,
                    wts: [
                        {
                            product: products[0],
                            size: '10',
                            quantity: 1,
                        } as Wts,
                        {
                            product: products[4],
                            size: '10',
                            quantity: 3,
                        } as Wts,
                    ],
                },
                {
                    id: 6,
                    username: 'Seller5',
                    credibility_score: 3.2,
                    wts: [
                        {
                            product: products[0],
                            size: '10',
                            quantity: 1,
                        } as Wts,
                    ],
                },
                {
                    id: 7,
                    username: 'Seller6',
                    credibility_score: 3.6,
                    wts: [
                        {
                            product: products[4],
                            size: '10',
                            quantity: 3,
                        } as Wts,
                    ],
                },
                {
                    id: 8,
                    username: 'Seller7',
                    credibility_score: 0,
                    wts: [
                        {
                            product: products[4],
                            size: '10',
                            quantity: 3,
                        } as Wts,
                    ],
                },
            ] as User[];

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockBuyer);
            jest.spyOn(userRepository, 'find').mockResolvedValue(mockSellers);

            const result = await matchesService.findMatchesForBuyer(buyerId);

            // Expectations for a more complex scenario
            expect(result.length).toBeLessThanOrEqual(5); // Two sellers with significant matches
            expect(result[0].seller.id).toBe(2); // Seller1 should be first (most matches)
            expect(result[1].seller.id).toBe(3); // Seller2 should be second

            // Check match scores
            expect(result[0].matchScore).toBeGreaterThanOrEqual(0.5);
            expect(result[1].matchScore).toBeGreaterThanOrEqual(0.25);

            expect(matchRepository.save).toHaveBeenCalled();
            expect(notificationsService.create).toHaveBeenCalledWith(
                buyerId,
                'match_found',
                expect.stringContaining('Seller1'),
            );
        });

        it('should handle scenarios with minimal or no matches', async () => {
            const buyerId = 1;

            // Create products with no overlap
            const products = [
                { sku: 'SHOE001', name: 'Running Shoes' },
                { sku: 'SHOE002', name: 'Hiking Boots' },
                { sku: 'SHOE003', name: 'Casual Sneakers' },
            ].map((p) => ({ sku: p.sku, name: p.name }) as Product);

            const mockBuyer = {
                id: buyerId,
                wtb: [
                    { product: products[0], size: '10' } as Wtb,
                    { product: products[1], size: '11' } as Wtb,
                ],
            } as User;

            const mockSellers = [
                {
                    id: 2,
                    username: 'Seller1',
                    credibility_score: 4.7,
                    wts: [{ product: products[2], size: '9' } as Wts],
                },
            ] as User[];

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockBuyer);
            jest.spyOn(userRepository, 'find').mockResolvedValue(mockSellers);

            const result = await matchesService.findMatchesForBuyer(buyerId);

            expect(result).toHaveLength(0);
            expect(matchRepository.save).toHaveBeenCalledWith([]);
            expect(notificationsService.create).not.toHaveBeenCalled();
        });
        it('should return top matches sorted by match score and credibility score', async () => {
            const buyerId = 1;

            const mockProduct1 = { sku: 'SKU1' } as Product;
            const mockProduct2 = { sku: 'SKU2' } as Product;
            const mockProduct3 = { sku: 'SKU3' } as Product;
            const mockProduct4 = { sku: 'SKU4' } as Product;

            const mockBuyer = {
                id: buyerId,
                wtb: [
                    { product: mockProduct1, size: 'M' } as Wtb,
                    { product: mockProduct2, size: 'L' } as Wtb,
                ],
            } as User;

            const mockSellers = [
                {
                    id: 2,
                    username: 'Seller1',
                    credibility_score: 4.5,
                    wts: [
                        { product: mockProduct1, size: 'M' } as Wts,
                        { product: mockProduct3, size: 'S' } as Wts,
                    ],
                },
                {
                    id: 3,
                    username: 'Seller2',
                    credibility_score: 3.8,
                    wts: [
                        { product: mockProduct2, size: 'L' } as Wts,
                        { product: mockProduct4, size: 'XL' } as Wts,
                    ],
                },
            ] as User[];

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockBuyer);
            jest.spyOn(userRepository, 'find').mockResolvedValue(mockSellers);

            const result = await matchesService.findMatchesForBuyer(buyerId);

            expect(result).toHaveLength(2); // Two matches
            expect(result[0].seller.id).toBe(2); // Seller1 should have the higher match score
            expect(result[1].seller.id).toBe(3);
            expect(matchRepository.save).toHaveBeenCalled();
        });

        it('should handle no matches gracefully', async () => {
            const buyerId = 1;

            const mockProduct1 = { sku: 'SKU1' } as Product;
            const mockProduct3 = { sku: 'SKU3' } as Product;

            const mockBuyer = {
                id: buyerId,
                wtb: [{ product: mockProduct1, size: 'M' } as Wtb],
            } as User;

            const mockSellers = [
                {
                    id: 2,
                    username: 'Seller1',
                    credibility_score: 4.5,
                    wts: [{ product: mockProduct3, size: 'L' } as Wts],
                },
            ] as User[];

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockBuyer);
            jest.spyOn(userRepository, 'find').mockResolvedValue(mockSellers);

            const result = await matchesService.findMatchesForBuyer(buyerId);

            expect(result).toHaveLength(0); // No matches
            expect(matchRepository.save).toHaveBeenCalledWith([]);
            expect(notificationsService.create).not.toHaveBeenCalled();
        });

        it('should save matches to the database and send notifications', async () => {
            const buyerId = 1;

            const mockProduct1 = { sku: 'SKU1' } as Product;

            const mockBuyer = {
                id: buyerId,
                wtb: [{ product: mockProduct1, size: 'M' } as Wtb],
            } as User;

            const mockSeller = {
                id: 2,
                username: 'Seller1',
                credibility_score: 4.5,
                wts: [{ product: mockProduct1, size: 'M' } as Wts],
            } as User;

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockBuyer);
            jest.spyOn(userRepository, 'find').mockResolvedValue([mockSeller]);

            const result = await matchesService.findMatchesForBuyer(buyerId);

            expect(result).toHaveLength(1);
            expect(matchRepository.save).toHaveBeenCalledTimes(1);
            expect(notificationsService.create).toHaveBeenCalledWith(
                buyerId,
                'match_found',
                expect.stringContaining('Seller1'),
            );
        });
    });

    describe('calculateOverlap', () => {
        it('should correctly calculate overlaps between WTB and WTS lists', () => {
            const mockProduct1 = { sku: 'SKU1' } as Product;

            const mockWtb: Wtb[] = [
                {
                    product: mockProduct1,
                    size: 'M',
                } as Wtb,
            ];

            const mockWts: Wts[] = [
                {
                    product: mockProduct1,
                    size: 'M',
                } as Wts,
                {
                    product: { sku: 'SKU3' } as Product,
                    size: 'XL',
                } as Wts,
            ];

            const overlap = (matchesService as any).calculateOverlap(
                mockWtb,
                mockWts,
            );

            expect(overlap).toHaveLength(1);
            expect(overlap[0].product.sku).toBe('SKU1');
            expect(overlap[0].size).toBe('M');
        });

        it('should return an empty array if no overlaps are found', () => {
            const mockWtb: Wtb[] = [
                {
                    product: { sku: 'SKU1' } as Product,
                    size: 'M',
                } as Wtb,
            ];
            const mockWts: Wts[] = [
                {
                    product: { sku: 'SKU2' } as Product,
                    size: 'L',
                } as Wts,
            ];

            const overlap = (matchesService as any).calculateOverlap(
                mockWtb,
                mockWts,
            );

            expect(overlap).toHaveLength(0);
        });
        it('should handle multiple overlap scenarios', () => {
            const products = [
                { sku: 'SHOE001', name: 'Running Shoes' },
                { sku: 'SHOE002', name: 'Hiking Boots' },
                { sku: 'SHOE003', name: 'Casual Sneakers' },
            ].map((p) => ({ sku: p.sku, name: p.name }) as Product);

            const mockWtb: Wtb[] = [
                { product: products[0], size: '10' } as Wtb,
                { product: products[1], size: '11' } as Wtb,
                { product: products[2], size: '9' } as Wtb,
            ];

            const mockWts: Wts[] = [
                { product: products[0], size: '10' } as Wts,
                { product: products[1], size: '11' } as Wts,
                { product: products[2], size: '8' } as Wts,
            ];

            const overlap = (matchesService as any).calculateOverlap(
                mockWtb,
                mockWts,
            );

            expect(overlap).toHaveLength(2);
            expect(overlap.map((o) => o.product.sku)).toContain('SHOE001');
            expect(overlap.map((o) => o.product.sku)).toContain('SHOE002');
        });
    });
});
