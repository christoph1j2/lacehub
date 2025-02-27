/* eslint-disable prettier/prettier */
import { Controller, Get, Param, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) {}

    @Get('/buyer/:buyerId')
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Returns matches for buyer' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async getMatchesForBuyer(@Param('buyerId', ParseIntPipe) buyerId: number) {
        try {
            return await this.matchesService.findMatchesForBuyer(buyerId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to get buyer matches',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Get('seller/:sellerId')
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Returns matches for seller' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async getMatchesForSeller(@Param('sellerId', ParseIntPipe) sellerId: number) {
        try {
            return await this.matchesService.findMatchesForSeller(sellerId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to get seller matches',
                HttpStatus.BAD_REQUEST
            );
        }
    }
}

/**
 * Matching process:

 * We find what buyers want (WTB) and what sellers offer (WTS)
 * Match when both product SKU and size match
 * Calculate match score based on overlap percentage


 * Data flow:

 * Load buyer/seller with their items
 * Find all potential matches
 * Calculate scores and sort
 * Save match records to database
 * Create notifications with correct match IDs


 * Important implementation detail:

 * Matches must be saved to database first
 * Then create notifications with match IDs
 * This ensures notification's match_id column is never null
 */