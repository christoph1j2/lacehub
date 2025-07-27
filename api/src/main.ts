import { DiscoveryService, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule, ApiResponse } from '@nestjs/swagger';
//import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());

    // Swagger setup
    if (process.env.NODE_ENV !== 'production') {
        const discoveryService = app.get(DiscoveryService);
        const controllers = discoveryService.getControllers();
        for (const controller of controllers) {
            ApiResponse({ status: 200, description: 'OK' })(
                controller.metatype,
            );
            ApiResponse({ status: 400, description: 'Bad Request' })(
                controller.metatype,
            );
            ApiResponse({ status: 401, description: 'Unauthorized' })(
                controller.metatype,
            );
            ApiResponse({ status: 403, description: 'Forbidden' })(
                controller.metatype,
            );
            ApiResponse({ status: 404, description: 'Not Found' })(
                controller.metatype,
            );
            ApiResponse({
                status: 429,
                description: 'Throttle! Too many requests!',
            })(controller.metatype);
        }

        const config = new DocumentBuilder()
            .setTitle('LaceHub API')
            .setDescription('The LaceHub API description')
            .setVersion('1.0')
            .addBearerAuth()
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
            customSiteTitle: 'LaceHub API Docs',
        });
    }

    // Rate limiter
    /*const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 500, // limit each IP to 500 requests per windowMs
    });
    app.use(limiter);*/

    // CORS
    app.enableCors({
        origin: '*', //['http://localhost:5173', 'https://www.lacehub.cz'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    // Helmet
    app.use(helmet());

    await app.listen(3000);
}
bootstrap();
