import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    /**
     * Validates the given payload.
     * @param payload The payload to validate.
     * @return The user that corresponds to the given payload.
     */
    async validate(payload: any) {
        console.log('JWT payload:', payload);
        const user = {
            id: payload.sub,
            username: payload.username,
            role: payload.role,
        };
        console.log('User attached to request:', user);
        return user;
    }
}
