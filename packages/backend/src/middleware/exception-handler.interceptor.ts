import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { CochonError } from '../utils/CochonError';
import { ErrorResponse } from './exception.model';

@Catch()
export class ExceptionHandlerInterceptor implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        // Default error
        let errorContext = {};
        let status = 404;
        let code = 'not-found';
        let message = 'route does not exist';

        if (exception instanceof HttpException) {
            code = exception.name;
            if (exception.getStatus()) status = exception.getStatus();
            if (exception.message) message = exception.message;
            if (exception.stack) errorContext = exception.stack;
            console.error(exception);
        } else if (exception instanceof CochonError) {
            code = exception.code;
            if (exception.status) status = exception.status;
            if (exception.message) message = exception.message;
            if (exception.context) errorContext = exception.context;
            if (exception.status === 500) console.error(exception);
            else console.debug(exception);
        } else if (exception instanceof Error) {
            status = 500;
            code = exception.name;
            message = exception.message;
            errorContext = { stack: exception.stack };
            console.error(exception);
        }
        const errorResponse: ErrorResponse = {
            code,
            status,
            message,
            timestamp: new Date().toISOString(),
        };

        response.status(status).json(errorResponse);
    }
}
