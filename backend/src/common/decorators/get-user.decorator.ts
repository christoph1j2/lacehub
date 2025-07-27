import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom parameter decorator to extract the authenticated user from the request object.
 *
 * This decorator provides a convenient way to access the user object that was
 * previously attached to the request by authentication guards or middleware.
 * It helps to reduce boilerplate code in controller methods that need access
 * to the currently authenticated user.
 *
 * @example
 * * // In a controller method:
 * @Get('profile')
 * getProfile(@GetUser() user: User) {
 *   return user;
 * }
 *
 *
 * @param data - Unused parameter required by the createParamDecorator function signature
 * @param ctx - The execution context, which provides access to the request object
 * @returns The user object from the request, or undefined if no user is present
 */
export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
