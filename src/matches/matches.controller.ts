/* eslint-disable prettier/prettier */
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('matches')
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) {}

    @Get('/buyer/:buyerId')
    @ApiBearerAuth()
    async getMatchesForBuyer(@Param('buyerId', ParseIntPipe) buyerId: number) {
        return await this.matchesService.findMatchesForBuyer(buyerId);
    }

    @Get('seller/:sellerId')
    @ApiBearerAuth()
    async getMatchesForSeller(@Param('sellerId', ParseIntPipe) sellerId: number) {
        return await this.matchesService.findMatchesForSeller(sellerId);
    }
}
