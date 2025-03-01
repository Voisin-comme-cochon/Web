import path from 'path';
import { writeFileSync } from 'fs';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';


const bootstrap = async () => {
    const app = await NestFactory.create(AppModule);

    app.enableVersioning({
        type: VersioningType.URI,
    });

    const outputPath = path.resolve(process.cwd(), 'swagger.json');
    writeFileSync(outputPath, JSON.stringify(document), { encoding: 'utf8' });

    await app.close();
};
void bootstrap();
