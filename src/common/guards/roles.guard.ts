import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UsersService } from '../../users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private usersService: UsersService,
    ) {}

    /**
     * This method is part of the CanActivate interface and is used by the Guard to determine
     * if the request should be allowed to proceed. It checks if the user has any of the roles
     * specified in the @Roles decorator.
     * @param context The ExecutionContext of the request.
     * @returns `true` if the request should proceed, `false` otherwise.
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
