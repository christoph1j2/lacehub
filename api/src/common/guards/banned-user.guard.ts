import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';

/**
 * Guard that prevents banned users from accessing protected resources.
 *
 * This guard checks if the authenticated user has been banned and, if so,
 * whether the ban is still active based on the ban expiration date.
 * It's designed to be used alongside authentication guards to provide
 * an additional layer of access control.
 *
 * @example
 * * // Apply to a controller or route
 * @UseGuards(JwtAuthGuard, BannedUserGuard)
 * @Get('matches')
 * getMatches() {
 * *  // Only accessible by users who are not banned
 * }
 *
 */
@Injectable()
export class BannedUserGuard implements CanActivate {
    /**
     * Checks if the current user is allowed to access the route.
     *
     * This method examines the user object from the request (attached by
     * an authentication guard) and checks if the user is banned. If the user
     * has an active ban (i.e., ban_expiration is in the future), it prevents
     * access by throwing a ForbiddenException with a message indicating when
     * the ban expires.
     *
     * @param context - The execution context, which provides access to the request
     * @returns true if the user is not banned or the ban has expired, allowing access to proceed
     * @throws ForbiddenException when the user has an active ban
     */
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Check if user exists
        if (!user) {
            return true; // Let other guards handle authentication issues
        }

        // Check if user is banned
        if (user.is_banned) {
            // Check ban expiration date - if it's in the past, user shouldn't be banned anymore
            const banExpiration = new Date(user.ban_expiration);
            const now = new Date();

            if (banExpiration > now) {
                throw new ForbiddenException(
                    `You are banned from using matching functionality until: ${user.ban_expiration}`,
                );
            }
        }

        return true;
    }
}
