import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());

    if (process.env.NODE_ENV !== 'production') {
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

    app.enableCors({
        origin: 'http://localhost:5173' /*'https://www.lacehub.cz'*/, //TODO: REPLACE WITH PROD URL LATER
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    })

    await app.listen(3000);
}
bootstrap();
