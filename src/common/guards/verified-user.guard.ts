import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

/**
 * Guard that ensures only email-verified users can access protected resources.
 *
 * This guard checks if the authenticated user has completed the email verification process.
 * It can be used to protect routes that should only be accessible to users who have
 * verified their email address, which helps maintain data integrity and security.
 *
 * This guard should be used after authentication guards like JwtAuthGuard that
 * attach the user object to the request.
 *
 * @example
 * * // Apply to a controller or route
 * @UseGuards(JwtAuthGuard, VerifiedUserGuard)
 * @Get('secure-data')
 * getSecureData() {
 *  * // Only accessible by authenticated users who have verified their email
 * }
 *
 */
@Injectable()
export class VerifiedUserGuard implements CanActivate {
    /**
     * Checks if the current user has verified their email address.
     *
     * This method examines the user object from the request (attached by
     * an authentication guard) and checks the 'verified' property. If the user
     * is not verified, access is denied with an appropriate error message.
     *
     * @param context - The execution context, which provides access to the request
     * @returns true if the user's email is verified, allowing access to proceed
     * @throws UnauthorizedException if:
     *   - No user object is found in the request
     *   - The verification status cannot be determined
     *   - The user has not completed email verification
     */
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (user.verified === undefined) {
            throw new UnauthorizedException(
                'Verification status not available',
            );
        }

        if (!user.verified) {
            console.log('User is not verified');
            throw new UnauthorizedException(
                'Please verify your email to access this resource',
            );
        }
        return true;
    }
}
