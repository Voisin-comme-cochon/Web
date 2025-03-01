import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = () => {
    return new DocumentBuilder()
        .setTitle('Voisin comme Cochon API')
        .setDescription('API for the Voisin comme Cochon App')
        .setVersion('1.0')
        .addTag('users');
};
