import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used to identify routes marked as public.
 *
 * This key is used by authentication guards to determine whether a route
 * should skip authentication checks.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator that marks a controller method as publicly accessible.
 *
 * When applied to a route handler, this decorator sets metadata that can be
 * read by guards to bypass authentication requirements. This is useful for
 * endpoints that should be accessible without authentication, such as login,
 * registration, or public API documentation.
 *
 * @example
 * * // In a controller:
 * @Public()
 * @Get('login')
 * login(@Body() loginDto: LoginDto) {
 *   * // This endpoint can be accessed without authentication
 *   return this.authService.login(loginDto);
 * }
 *
 *
 * @returns A decorator function that sets the IS_PUBLIC_KEY metadata to true
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
