import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UsersService } from '../../users/users.service';

/**
 * Guard that implements role-based access control for routes and controllers.
 *
 * This guard works in conjunction with the @Roles() decorator to restrict access
 * to specific routes based on the user's role. It uses NestJS's Reflector to
 * examine metadata and determine what roles are required for a given endpoint.
 *
 * @example
 * * // Register the guard globally
 * providers: [
 *   {
 *     provide: APP_GUARD,
 *     useClass: RolesGuard,
 *   },
 * ]
 *
 * * // Or use it on specific controllers/routes
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin')
 * @Controller('admin')
 * export class AdminController {
 *  * // Routes in this controller are only accessible to users with the 'admin' role
 * }
 *
 */
@Injectable()
export class RolesGuard implements CanActivate {
    /**
     * Creates an instance of RolesGuard.
     *
     * @param reflector - NestJS Reflector service used to retrieve metadata from decorators
     * @param usersService - Service for retrieving user information from the database
     */
    constructor(
        private reflector: Reflector,
        private usersService: UsersService,
    ) {}

    /**
     * Determines whether a request has the necessary roles to proceed.
     *
     * This method checks if the user making the request has the required roles
     * to access a specific handler or class. It retrieves the roles from metadata
     * using the Reflector service and verifies them against the user's roles
     * obtained from the UsersService.
     *
     * @param context - The execution context, which provides details about the
     * request being processed, including the handler and class.
     * @returns A promise that resolves to a boolean value. It returns true if the
     * user has the necessary roles or if no roles are required, otherwise false.
     *
     * Logs various debug information during the process, including required roles,
     * user information, and role-check results.
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
        console.log('====== RolesGuard Debug ======');
        console.log('Required roles:', requiredRoles);

        if (!requiredRoles) {
            console.log('No roles required, allowing access');
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        console.log('Request user:', user);

        if (!user) {
            console.log('No user in request, denying access');
            return false;
        }

        const fullUser = await this.usersService.findOneById(user.id);
        console.log('Full user from database:', fullUser);

        if (!fullUser) {
            console.log('User not found in database, denying access');
            return false;
        }

        const hasRole = requiredRoles.includes(fullUser.role.role_name);
        console.log('Role check:', {
            requiredRoles,
            userRole: fullUser.role,
            hasRole,
        });
        console.log('====== End RolesGuard Debug ======');

        return hasRole;
    }
}
