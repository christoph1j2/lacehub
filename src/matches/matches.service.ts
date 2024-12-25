import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from '../entities/match.entity';
import { User } from '../entities/user.entity';
import { Wtb } from '../entities/wtb.entity';
import { Wts } from '../entities/wts.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Not, Repository } from 'typeorm';

//! TODO: playwright
@Injectable()
export class MatchesService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Wtb)
        private readonly wtbRepository: Repository<Wtb>,
        @InjectRepository(Wts)
        private readonly wtsRepository: Repository<Wts>,
        @InjectRepository(Match)
        private readonly matchRepository: Repository<Match>,

        private readonly notificationsService: NotificationsService,
    ) {}

    async findMatchesForBuyer(buyerId: number): Promise<any> {
        const buyer = await this.userRepository.findOne({
            where: { id: buyerId },
            relations: ['wtb', 'wtb.product'],
        });

        const sellers = await this.userRepository.find({
            where: { id: Not(buyerId) },
            relations: ['wts', 'wts.product'],
        });

        const matches = [];
        for (const seller of sellers) {
            const overlap = this.calculateOverlap(buyer.wtb, seller.wts);

            if (overlap.length > 0) {
                const matchScore = overlap.length / buyer.wtb.length;

                matches.push({
                    seller,
                    overlap,
                    matchScore,
                    credibilityScore: seller.credibility_score,
                });
            }
        }

        // Sort and pick top 5 matches
        matches.sort(
            (a, b) =>
                b.matchScore - a.matchScore ||
                b.credibilityScore - a.credibilityScore,
        );

        const topMatches = matches.slice(0, 5);

        // Only create notification and save matches if there are matches
        if (topMatches.length > 0) {
            // Create single grouped notification for the buyer
            const notificationContent = topMatches
                .map(
                    (match, index) =>
                        `#${index + 1}: ${match.seller.username} (${match.matchScore.toFixed(
                            2,
                        )} matches, Credibility: ${match.credibilityScore})`,
                )
                .join('\n');

            await this.notificationsService.create(
                buyer.id,
                'match_found',
                `Top 5 Matches Found for Your WTB List:\n\n${notificationContent}`,
            );

            // Save matches to the database
            await this.matchRepository.save(
                topMatches
                    .map((match) => {
                        const overlapItems = match.overlap;
                        return overlapItems.map((item) => ({
                            wtb: item,
                            wts: match.seller.wts.find(
                                (wts) =>
                                    wts.product.sku === item.product.sku &&
                                    wts.size === item.size,
                            ),
                            buyer: buyer,
                            seller: match.seller,
                            match_score: match.matchScore,
                            createdAt: new Date(),
                            status: 'pending',
                        }));
                    })
                    .flat(), // Flatten the array to handle multiple overlaps per match.
            );
        } else {
            // If no matches, save an empty array to satisfy the repository save method
            await this.matchRepository.save([]);
        }

        return topMatches;
    }

    async findMatchesForSeller(sellerId: number): Promise<any> {
        const seller = await this.userRepository.findOne({
            where: { id: sellerId },
            relations: ['wts', 'wts.product'],
        });

        const buyers = await this.userRepository.find({
            where: { id: Not(sellerId) },
            relations: ['wtb', 'wtb.product'],
        });

        const matches = [];
        for (const buyer of buyers) {
            const overlap = this.calculateOverlap(buyer.wtb, seller.wts);
            const matchScore = overlap.length / seller.wts.length;

            matches.push({
                buyer,
                overlap,
                matchScore,
                credibilityScore: buyer.credibility_score,
            });
        }

        // Sort and pick top 5 matches
        matches.sort(
            (a, b) =>
                b.matchScore - a.matchScore ||
                b.credibilityScore - a.credibilityScore,
        );

        const topMatches = matches.slice(0, 5);

        // Notify seller for each match (optional: could also aggregate like buyers)
        for (const match of topMatches) {
            await this.notificationsService.create(
                seller.id,
                'match_found',
                `You have a match with ${match.buyer.username}! Credibility: ${match.credibilityScore}`,
            );
        }

        // Save matches to the database
        await this.matchRepository.save(
            topMatches
                .map((match) => {
                    const overlapItems = match.overlap;
                    return overlapItems.map((item) => ({
                        wtb: item.wtb,
                        wts: item.wts,
                        buyer: match.buyer,
                        seller: match.seller,
                        match_score: match.matchScore,
                        createdAt: new Date(),
                        status: 'pending',
                    }));
                })
                .flat(), // Flatten the array to handle multiple overlaps per match.
        );

        return topMatches;
    }

    private calculateOverlap(wtbList: Wtb[], wtsList: Wts[]): any[] {
        return wtbList.filter((wtb) =>
            wtsList.some(
                (wts) =>
                    wts.product.sku === wtb.product.sku &&
                    wts.size === wtb.size,
            ),
        );
    }

    //todo other methods for admins
}
