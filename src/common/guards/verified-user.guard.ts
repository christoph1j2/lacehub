import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class VerifiedUserGuard implements CanActivate {
    /**
     * CanActivate implementation that checks if the user is verified.
     *
     * @param context ExecutionContext to access the request object.
     * @returns boolean indicating whether the user is authorized to access the resource.
     * @throws UnauthorizedException if the user is not verified, or if the verification status is not available.
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
