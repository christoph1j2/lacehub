import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class VerifiedUserGuard implements CanActivate {
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
