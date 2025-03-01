import dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import * as pckg from '../package.json';
import { swaggerConfig } from './swagger.config';
import { AppModule } from './app.module';

const port = process.env.PORT ?? 3000;

const initSwagger = (app: INestApplication) => {
    const document = SwaggerModule.createDocument(app, swaggerConfig().build());
    SwaggerModule.setup('openapi', app, document);
};

const bootstrap = async () => {
    const app: INestApplication = await NestFactory.create(AppModule);
    initSwagger(app);

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
