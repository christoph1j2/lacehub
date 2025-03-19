/* eslint-disable prefer-const */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from '../entities/match.entity';
import { User } from '../entities/user.entity';
import { Wtb } from '../entities/wtb.entity'; // Want to Buy
import { Wts } from '../entities/wts.entity'; // Want to Sell
import { NotificationsService } from '../notifications/notifications.service';
import { Not, Repository, Between } from 'typeorm';

//? TODO: playwright
@Injectable()
export class MatchesService {
    constructor(
        // Inject repositories for all required entities
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Wtb)
        private readonly wtbRepository: Repository<Wtb>,
        @InjectRepository(Wts)
        private readonly wtsRepository: Repository<Wts>,
        @InjectRepository(Match)
        private readonly matchRepository: Repository<Match>,
        // Inject notification service to create notifications for matches
        private readonly notificationsService: NotificationsService,
    ) {}

    /**
     * Finds potential matches for a buyer based on what they want to buy
     * and what others want to sell
     *
     * @param buyerId - ID of the buyer to find matches for
     * @returns Array of top 5 matches sorted by match score and credibility
     */
    async findMatchesForBuyer(buyerId: number): Promise<any> {
        // Get buyer with their Want-To-Buy items
        const buyer = await this.userRepository.findOne({
            where: { id: buyerId },
            relations: ['wtb', 'wtb.product'], // Include WTB items and their products
        });

        // Check if buyer exists and has wtb items
        if (!buyer || !buyer.wtb || buyer.wtb.length === 0) {
            // Return empty array if buyer has no wtb items
            return [];
        }

        // Get all potential sellers (everyone except the buyer)
        const sellers = await this.userRepository.find({
            where: { id: Not(buyerId) }, // Exclude the buyer
            relations: ['wts', 'wts.product'], // Include WTS items and their products
        });

        // Array to store potential matches
        const matches = [];

        // For each potential seller, check if there's an overlap between
        // what buyer wants and what seller offers
        for (const seller of sellers) {
            // Skip sellers with no wts items to avoid null/undefined issues
            if (!seller.wts || seller.wts.length === 0) {
                continue;
            }

            // Find overlapping items (items that buyer wants and seller has)
            const overlap = this.calculateOverlap(buyer.wtb, seller.wts);

            if (overlap.length > 0) {
                // Calculate match score as percentage of buyer's wants fulfilled
                const matchScore = overlap.length / buyer.wtb.length;

                // Add to potential matches
                matches.push({
                    seller,
                    overlap, // Items that match between buyer and seller
                    matchScore, // How good the match is (higher is better)
                    credibilityScore: seller.credibility_score || 0, // Seller reputation (default to 0 if null)
                });
            }
        }

        // If no matches were found, return empty array
        if (matches.length === 0) {
            return [];
        }

        // Sort matches by score (highest first) and then by credibility
        matches.sort(
            (a, b) =>
                b.matchScore - a.matchScore || // First by match score
                (b.credibilityScore || 0) - (a.credibilityScore || 0), // Then by credibility, defaulting to 0 if null
        );

        // Take only the top 5 matches
        const topMatches = matches.slice(0, 5);

        // IMPORTANT: We need to save match records in database BEFORE creating notifications
        // This ensures each notification has a valid match_id reference
        const savedMatches = await this.matchRepository.save(
            topMatches
                .map((match) => {
                    const overlapItems = match.overlap;
                    // For each overlapping item, create a match record
                    return overlapItems.map((item) => ({
                        wtb: item, // The wanted item
                        wts: match.seller.wts.find(
                            (wts) =>
                                wts.product.sku === item.product.sku &&
                                wts.size === item.size,
                        ), // The matching selling item
                        buyer: buyer,
                        seller: match.seller,
                        match_score: match.matchScore,
                        buyer_credibility: match.buyer.credibility_score || 0,
                        created_at: new Date(),
                        status: 'pending', // Initial status
                    }));
                })
                .flat(), // Flatten the nested arrays
        );

        // Replace individual notifications with batch notification
        if (savedMatches.length > 0) {
            // Send a single batch notification to the buyer
            await this.notificationsService.createMatchBatchNotification(
                buyer.id,
                'match_found',
                savedMatches,
                'buyer',
            );

            // Optionally notify sellers individually about their single matches
            // Group matches by seller
            const matchesBySeller = this.groupMatchesBySeller(savedMatches);

            // For each seller, send a batch notification about all their matches with this buyer
            for (const [sellerId, sellerMatches] of Object.entries(
                matchesBySeller,
            )) {
                await this.notificationsService.createMatchBatchNotification(
                    parseInt(sellerId),
                    'match_found',
                    sellerMatches,
                    'seller',
                );
            }
        }

        return topMatches; // Return top matches for display
    }

    /**
     * Finds potential matches for a seller based on what they want to sell
     * and what others want to buy
     *
     * @param sellerId - ID of the seller to find matches for
     * @returns Array of top 5 matches sorted by match score and credibility
     */
    async findMatchesForSeller(sellerId: number): Promise<any> {
        // Get seller with their Want-To-Sell items
        const seller = await this.userRepository.findOne({
            where: { id: sellerId },
            relations: ['wts', 'wts.product'], // Include WTS items and their products
        });

        // Check if seller exists and has wts items
        if (!seller || !seller.wts || seller.wts.length === 0) {
            // Return empty array if seller has no wts items
            return [];
        }

        // Get all potential buyers (everyone except the seller)
        const buyers = await this.userRepository.find({
            where: { id: Not(sellerId) }, // Exclude the seller
            relations: ['wtb', 'wtb.product'], // Include WTB items and their products
        });

        // Array to store potential matches
        const matches = [];

        // For each potential buyer, check if there's an overlap between
        // what seller offers and what buyer wants
        for (const buyer of buyers) {
            // Skip buyers with no wtb items to avoid null/undefined issues
            if (!buyer.wtb || buyer.wtb.length === 0) {
                continue;
            }

            // Find overlapping items (items that seller offers and buyer wants)
            const overlap = this.calculateOverlap(buyer.wtb, seller.wts);

            // Only add to matches if there's an actual overlap
            if (overlap.length > 0) {
                // Calculate match score as percentage of seller's items that match
                const matchScore = overlap.length / seller.wts.length;

                // Add to potential matches
                matches.push({
                    buyer,
                    overlap, // Items that match between buyer and seller
                    matchScore, // How good the match is (higher is better)
                    credibilityScore: buyer.credibility_score || 0, // Buyer reputation (default to 0 if null)
                });
            }
        }

        // If no matches were found, return empty array
        if (matches.length === 0) {
            return [];
        }

        // Sort matches by score (highest first) and then by credibility
        matches.sort(
            (a, b) =>
                b.matchScore - a.matchScore || // First by match score
                (b.credibilityScore || 0) - (a.credibilityScore || 0), // Then by credibility, using 0 as default
        );

        // Take only the top 5 matches
        const topMatches = matches.slice(0, 5);

        // IMPORTANT: We need to save match records in database BEFORE creating notifications
        // This ensures each notification has a valid match_id reference
        const savedMatches = await this.matchRepository.save(
            topMatches
                .map((match) => {
                    const overlapItems = match.overlap;
                    // For each overlapping item, create a match record
                    return overlapItems.map((item) => ({
                        wtb: item, // The wanted item
                        wts: seller.wts.find(
                            (wts) =>
                                wts.product.sku === item.product.sku &&
                                wts.size === item.size,
                        ), // The matching selling item
                        buyer: match.buyer,
                        seller: seller,
                        match_score: match.matchScore,
                        seller_credibility: match.seller.credibility_score || 0,
                        created_at: new Date(),
                        status: 'pending', // Initial status
                    }));
                })
                .flat(), // Flatten the nested arrays
        );

        // Replace individual notifications with batch notification
        if (savedMatches.length > 0) {
            // Send a single batch notification to the seller
            await this.notificationsService.createMatchBatchNotification(
                seller.id,
                'match_found',
                savedMatches,
                'seller',
            );

            // Optionally notify buyers individually about their single matches
            // Group matches by buyer
            const matchesByBuyer = this.groupMatchesByBuyer(savedMatches);

            // For each buyer, send a batch notification about all their matches with this seller
            for (const [buyerId, buyerMatches] of Object.entries(
                matchesByBuyer,
            )) {
                await this.notificationsService.createMatchBatchNotification(
                    parseInt(buyerId),
                    'match_found',
                    buyerMatches,
                    'buyer',
                );
            }
        }

        return topMatches; // Return top matches for display
    }

    /**
     * Calculates the overlap between what a buyer wants and what a seller offers
     *
     * @param wtbList - List of items buyer wants to buy
     * @param wtsList - List of items seller wants to sell
     * @returns Array of overlapping items (WTB items that have matching WTS items)
     */
    private calculateOverlap(wtbList: Wtb[], wtsList: Wts[]): any[] {
        // Find items from wtbList that have a matching item in wtsList
        // Item matches if both product SKU and size are the same
        return wtbList.filter((wtb) =>
            wtsList.some(
                (wts) =>
                    wts.product.sku === wtb.product.sku &&
                    wts.size === wtb.size,
            ),
        );
    }

    /**
     * Groups matches by seller ID
     * @param matches Array of match objects
     * @returns Object with seller IDs as keys and arrays of matches as values
     */
    private groupMatchesBySeller(matches: Match[]): Record<number, Match[]> {
        const result: Record<number, Match[]> = {};

        matches.forEach((match) => {
            const sellerId = match.seller.id;
            if (!result[sellerId]) {
                result[sellerId] = [];
            }
            result[sellerId].push(match);
        });

        return result;
    }

    /**
     * Groups matches by buyer ID
     * @param matches Array of match objects
     * @returns Object with buyer IDs as keys and arrays of matches as values
     */
    private groupMatchesByBuyer(matches: Match[]): Record<number, Match[]> {
        const result: Record<number, Match[]> = {};

        matches.forEach((match) => {
            const buyerId = match.buyer.id;
            if (!result[buyerId]) {
                result[buyerId] = [];
            }
            result[buyerId].push(match);
        });

        return result;
    }

    /**
     * Gets match activity counts per day for a date range
     * Useful for generating graphs showing match activity over time
     *
     * @param startDate - Beginning of date range (defaults to start of current week)
     * @param endDate - End of date range (defaults to end of current week)
     * @returns Object with daily match counts
     */
    async matchActivityPerDay(startDate?: Date, endDate?: Date): Promise<any> {
        // Default to current week if no dates provided
        const today = new Date();
        const start =
            startDate ||
            new Date(today.setDate(today.getDate() - today.getDay())); // Start of week (Sunday)
        start.setHours(0, 0, 0, 0);

        const end =
            endDate || new Date(new Date(start).setDate(start.getDate() + 6)); // End of week (Saturday)
        end.setHours(23, 59, 59, 999);

        const matches = await this.matchRepository.find({
            where: {
                created_at: Between(start, end),
            },
        });

        // Initialize result object with zero counts for each day
        const result = {
            labels: [],
            counts: [],
            totalMatches: matches.length,
        };

        // Generate all dates in the range
        const dateLabels = [];
        const dateCounts = {};

        // Create a date range array and initialize counts to zero
        let currentDate = new Date(start);
        while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
            dateLabels.push(dateStr);
            dateCounts[dateStr] = 0;
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Count matches per day
        matches.forEach((match) => {
            const matchDate = new Date(match.created_at);
            const dateStr = matchDate.toISOString().split('T')[0];
            if (dateCounts[dateStr] !== undefined) {
                dateCounts[dateStr]++;
            }
        });

        // Set the final values
        result.labels = dateLabels;
        result.counts = dateLabels.map((date) => dateCounts[date]);

        return result;
    }

    /**
     * Returns the total number of matches in the database
     *
     * @returns Total number of matches
     */
    async totalMatches(): Promise<number> {
        return this.matchRepository.count();
    }
}
