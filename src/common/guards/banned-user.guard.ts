import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';

//!fix
export class BannedUserGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        /*const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (user.is_banned) {
            throw new ForbiddenException(
                'You are banned from the platform until: ' +
                    user.ban_expiration,
            );
        }*/
        return true;
    }
}
