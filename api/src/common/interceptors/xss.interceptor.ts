import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as sanitizeHtml from 'sanitize-html';

/**
 * XSS Interceptor
 *
 * This interceptor provides protection against Cross-Site Scripting (XSS) attacks
 * by sanitizing all outgoing response data. It removes potentially malicious
 * HTML/JavaScript code that could be executed in client browsers.
 *
 * The sanitization process recursively traverses through response objects,
 * arrays, and nested structures to ensure all string values are properly sanitized.
 */
@Injectable()
export class Interceptor implements NestInterceptor {
    /**
     * Intercepts the response data stream and applies HTML sanitization
     *
     * @param context - Execution context containing request/response details
     * @param next - CallHandler to control the flow to the route handler
     * @returns Observable with sanitized response data
     */
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                // Process the response data through the sanitizer
                return this.sanitizeOutput(data);
            }),
        );
    }

    /**
     * Recursively sanitizes data to prevent XSS attacks
     *
     * This method handles different data types:
     * - null/undefined: returned as-is
     * - strings: HTML-sanitized using sanitize-html library
     * - arrays: each element is recursively sanitized
     * - objects: each property is recursively sanitized
     * - other types (numbers, booleans, etc.): returned as-is
     *
     * @param data - The data to sanitize (any type)
     * @returns Sanitized version of the input data
     */
    private sanitizeOutput(data: any): any {
        // Skip sanitization for null/undefined values
        if (!data) return data;

        // Directly sanitize string values
        if (typeof data === 'string') {
            return sanitizeHtml(data);
        }

        // Handle arrays by sanitizing each element
        if (Array.isArray(data)) {
            return data.map((item) => this.sanitizeOutput(item));
        }

        // Handle objects by sanitizing each property
        if (typeof data === 'object') {
            const result = { ...data }; // Create a shallow copy to avoid modifying the original
            for (const key in result) {
                result[key] = this.sanitizeOutput(result[key]);
            }
            return result;
        }

        // Return other data types unchanged (numbers, booleans, etc.)
        return data;
    }
}
