import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used to identify role requirements for routes.
 *
 * This key is used by role-based guards to determine which roles are allowed
 * to access specific routes or controllers.
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator that assigns required roles to controller methods or classes.
 *
 * When applied to a route handler or controller, this decorator sets metadata that can be
 * read by guards to enforce role-based access control. Only users with the specified
 * roles will be allowed to access the decorated routes.
 *
 * @example
 * * // Applied to a controller method:
 * @Roles('admin')
 * @Get('sensitive-data')
 * getSensitiveData() {
 *   * // Only users with the 'admin' role can access this endpoint
 *   return this.dataService.getSensitiveData();
 * }
 *
 * * // Applied to an entire controller:
 * @Roles('admin', 'manager')
 * @Controller('admin')
 * export class AdminController {
 *  * // Only users with 'admin' or 'manager' roles can access this controller
 * }
 *
 *
 * @param roles - An array of role names that are allowed to access the decorated route
 * @returns A decorator function that sets the ROLES_KEY metadata with the provided roles
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
