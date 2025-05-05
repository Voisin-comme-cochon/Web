import './utils/load-env';
import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as pckg from '../package.json';
import { initValidation } from './setup/init-validation';
import { loggerMiddleware } from './middleware/logger.middleware';
import { AppModule } from './app.module';

const port = process.env.VCC_API_PORT ?? 3000;

const bootstrap = async () => {
    const app: INestApplication = await NestFactory.create(AppModule);
    app.use(loggerMiddleware);
    initValidation(app);

    const config = new DocumentBuilder()
        .setTitle('Voisin comme cochon API')
        .setDescription('The vcc openapi documentation')
        .setVersion('1.0')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('openapi', app, documentFactory);

    app.enableCors({
        origin: [
            'http://localhost:8080',
            'https://voisincommecochon.fr',
            'https://38.242.223.232:8080',
            'http://localhost:5173',
        ], // ou '*' pour tous les domaines (pas recommandé en prod)
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    await app.listen(port);
};
bootstrap()
    .then(() => {
        console.log(`Starting ${pckg.name} version ${pckg.version} on port ${port}`);
    })
    .catch((e: unknown) => {
        if (e instanceof Error) {
            console.error(e.message);
        }
        console.error('An error occurs during the bootstrap process', {
            error: e,
        });
    });
