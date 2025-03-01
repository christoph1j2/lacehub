/* eslint-disable prettier/prettier */
import { Controller, Get, Param, ParseIntPipe, HttpException, HttpStatus, UseGuards, Req, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { ApiBearerAuth, ApiResponse, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { BannedUserGuard } from '../common/guards/banned-user.guard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@ApiTags('matches')
@Controller('matches')
@SkipThrottle()
@UseGuards(JwtAuthGuard)
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) {}

    @Get('/my-buyer-matches')
    @UseGuards(BannedUserGuard)
    @Throttle({ match: {limit: 1, ttl: 120000} })
    @ApiBearerAuth()
    @ApiOperation({
      description: 'Returns matches for authenticated buyer',
    })
    @ApiResponse({ status: 429, description: 'You can only match once per 2 minutes.' })
    async getMyBuyerMatches(@Req() request) {
        try {
            // Get the user ID from the authenticated token
            const userId = request.user.id;
            return await this.matchesService.findMatchesForBuyer(userId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to get buyer matches',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Get('/my-seller-matches')
    @UseGuards(BannedUserGuard)
    @Throttle({ match: {limit: 1, ttl: 120000} })
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Returns matches for authenticated seller' })
    @ApiResponse({ status: 429, description: 'You can only match once per 2 minutes.' })
    async getMySellerMatches(@Req() request) {
        try {
            // Get the user ID from the authenticated token
            const userId = request.user.id;
            return await this.matchesService.findMatchesForSeller(userId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to get seller matches',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    // If admin access is needed, add proper authorization checks
    @Get('/admin/buyer/:buyerId')
    @Roles('admin') // Implement this guard for admin-only access
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Admin access: Returns matches for buyer' })
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

    @Get('/admin/seller/:sellerId')
    @Roles('admin')
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Admin access: Returns matches for seller' })
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

    @Get('/admin/daily-matches')
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
    description: 'Returns match activity counts per day for a date range',
    })
    @ApiResponse({ status: 200, description: 'Returns daily match counts for graphing' })
    @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date in YYYY-MM-DD format' })
    @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date in YYYY-MM-DD format' })
    async getMatchActivity(@Query('startDate') startDateStr?: string, @Query('endDate') endDateStr?: string) {
        try {
            const startDate = startDateStr ? new Date(startDateStr) : undefined;
            const endDate = endDateStr ? new Date(endDateStr) : undefined;

            return await this.matchesService.matchActivityPerDay(startDate, endDate);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to get match activity data',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Get('/admin/total-matches')
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
    description: 'Returns total match count.',
    })
    async getTotalMatches() {
        try {
            return await this.matchesService.totalMatches();
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to get total match count',
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