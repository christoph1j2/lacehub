/* eslint-disable prettier/prettier */
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) {}

    @Get('/buyer/:buyerId')
    async getMatchesForBuyer(@Param('buyerId', ParseIntPipe) buyerId: number) {
        return await this.matchesService.findMatchesForBuyer(buyerId);
    }

    @Get('seller/:sellerId')
    async getMatchesForSeller(@Param('sellerId', ParseIntPipe) sellerId: number) {
        return await this.matchesService.findMatchesForSeller(sellerId);
    }

    //todo other endpoints for admins
}
