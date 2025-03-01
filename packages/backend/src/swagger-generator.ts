import path from 'path';
import { writeFileSync } from 'fs';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';

process.env.NODE_CONFIG_DIR = `${__dirname}/../config/`;
import { swaggerConfig } from './swagger.config';

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule);

    app.enableVersioning({
        type: VersioningType.URI,
    });

    const options = swaggerConfig().addServer('https://skeleton-service.affluences.dev');
    const document = SwaggerModule.createDocument(app, options.build());
    const outputPath = path.resolve(process.cwd(), 'swagger.json');
    writeFileSync(outputPath, JSON.stringify(document), { encoding: 'utf8' });

    await app.close();
};
void bootstrap();
