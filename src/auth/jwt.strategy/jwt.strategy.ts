import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    /**
     * Constructs a new instance of the JwtStrategy class.
     * @param configService The service providing access to the application configuration.
     * @constructor
     */
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    /**
     * Validates the payload of the JWT. This method is called by the Passport.js
     * framework when a JWT is received. It should return the validated user object
     * or throw an exception if the validation fails.
     * @param payload The payload of the JWT.
     * @returns The validated user object.
     */
    async validate(payload: any) {
        return {
            id: payload.sub,
            username: payload.username,
            role: payload.role,
        };
    }
}
