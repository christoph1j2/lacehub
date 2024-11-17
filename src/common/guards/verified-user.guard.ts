import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class VerifiedUserGuard implements CanActivate {
    /**
     * Guard to check if the user is verified
     * @param context The ExecutionContext of the request
     * @returns `true` if the user is verified, `false` otherwise
     * @throws UnauthorizedException if the user is not verified
     */
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user.verified) {
            throw new UnauthorizedException(
                'Please verify your email to access this resource',
            );
        }
        return true;
    }
}
