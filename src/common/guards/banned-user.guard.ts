import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';

@Injectable() // Add Injectable decorator which was missing
export class BannedUserGuard implements CanActivate {
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
