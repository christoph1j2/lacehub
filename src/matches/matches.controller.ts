/* eslint-disable prettier/prettier */
import { Controller, Get, Param, ParseIntPipe, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { BannedUserGuard } from '../common/guards/banned-user.guard';

@ApiTags('matches')
@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) {}

    @Get('/my-buyer-matches')
    @UseGuards(BannedUserGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Returns matches for authenticated buyer' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 400, description: 'Bad request' })
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
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Returns matches for authenticated seller' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 400, description: 'Bad request' })
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
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
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