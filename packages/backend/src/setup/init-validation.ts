import { INestApplication, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { AppModule } from '../app.module';
import { CochonError } from '../utils/CochonError';
import { ExceptionHandlerInterceptor } from '../middleware/exception-handler.interceptor';

export const initValidation = (app: INestApplication) => {
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(
        new ValidationPipe({
            enableDebugMessages: true,
            exceptionFactory: (errors) => {
                const validationError = new CochonError('validation-errors', 'A validation error occurs', 400, {
                    details: errors.map((error) => ({
                        property: error.property,
                        constraints: error.constraints,
                        value: error.value as string,
                    })),
                });
                console.error('validation-errors', validationError);
                throw validationError;
            },
        })
    );
    app.useGlobalFilters(new ExceptionHandlerInterceptor());
};
