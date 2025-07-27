import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as sanitizeHtml from 'sanitize-html';

/**
 * XSS Middleware
 *
 * This middleware provides protection against Cross-Site Scripting (XSS) attacks
 * by sanitizing all incoming request data. It removes potentially malicious
 * HTML/JavaScript code that could be injected through request bodies.
 *
 * The middleware intercepts incoming requests before they reach route handlers,
 * sanitizes the request body, and then passes control to the next middleware or handler.
 */
@Injectable()
export class XssMiddleware implements NestMiddleware {
    /**
     * Middleware function that processes incoming requests
     *
     * @param req - Express request object containing client request data
     * @param res - Express response object for sending response to client
     * @param next - Function to pass control to the next middleware/handler
     */
    use(req: Request, res: Response, next: NextFunction) {
        // Only process requests that have a body
        if (req.body) {
            this.sanitize(req.body);
        }
        // Continue to the next middleware/handler in the chain
        next();
    }

    /**
     * Recursively sanitizes request data to prevent XSS attacks
     *
     * This method traverses through the object properties:
     * - String values are sanitized using sanitize-html with strict configuration
     * - Nested objects are recursively processed
     * - Other data types are left unchanged
     *
     * The sanitization is applied in-place, modifying the original object directly.
     *
     * @param obj - Object to sanitize (typically the request body or a nested object)
     */
    private sanitize(obj: any) {
        for (const prop in obj) {
            if (typeof obj[prop] === 'string') {
                // Sanitize string values with very strict configuration:
                // - No HTML tags allowed (empty allowedTags array)
                // - No HTML attributes allowed (empty allowedAttributes object)
                obj[prop] = sanitizeHtml(obj[prop], {
                    allowedTags: [], // Allow no HTML tags
                    allowedAttributes: {}, // Allow no HTML attributes
                });
            } else if (typeof obj[prop] === 'object' && obj[prop] !== null) {
                // Recursively sanitize nested objects (including arrays)
                this.sanitize(obj[prop]);
            }
            // Non-string, non-object values (numbers, booleans, null, etc.) remain unchanged
        }
    }
}
