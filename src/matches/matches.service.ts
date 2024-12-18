import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from 'src/entities/match.entity';
import { User } from 'src/entities/user.entity';
import { Wtb } from 'src/entities/wtb.entity';
import { Wts } from 'src/entities/wts.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Not, Repository } from 'typeorm';

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
            const matchScore = overlap.length / buyer.wtb.length;

            matches.push({
                seller,
                overlap,
                matchScore,
                credibilityScore: seller.credibility_score,
            });
        }

        matches.sort(
            (a, b) =>
                b.matchScore - a.matchScore ||
                b.credibilityScore - a.credibilityScore,
        );

        const topMatches = matches.slice(0, 5);

        for (const match of topMatches) {
            await this.createMatchNotificationForBuyer(match, buyer);
        }

        //? idk
        this.matchRepository.save(
            topMatches.map((match) => {
                return {
                    seller: match.seller,
                    buyer: buyer,
                    match_score: match.matchScore,
                    status: 'pending',
                };
            }),
        );
        return topMatches;
    }
    async findMatchesForSeller() {
        // TODO
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

    private async createMatchNotificationForBuyer(match, buyer) {
        const riskMessage = this.getRiskMessage(match.credibilityScore);
        await this.notificationsService.create(
            buyer.id,
            'Match',
            `You have a match with ${match.seller.username}! Risk: ${riskMessage}`,
        );
    }
    private async createMatchNotificationForSeller(match, seller) {
        const riskMessage = this.getRiskMessage(match.credibilityScore);
        await this.notificationsService.create(
            seller.id,
            'Match',
            `You have a match with ${match.buyer.username}! Risk: ${riskMessage}`,
        );
    }
    private getRiskMessage(score: number): string {
        if (score > 10) return 'Low Risk';
        if (score > -5) return 'Medium Risk';
        return 'High Risk';
    }
}
