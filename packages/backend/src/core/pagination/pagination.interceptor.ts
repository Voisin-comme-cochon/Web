import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import {
    Paginated,
    PaginationMetadata,
    MetadataResponseBuilder,
} from './pagination';

export interface TransformedPaginatedResponse<T> {
    data: T[];
    metadata: PaginationMetadata;
}

@Injectable()
export class PaginationInterceptor<T>
    implements NestInterceptor<Paginated<T>, TransformedPaginatedResponse<T>>
{
    intercept(
        context: ExecutionContext,
        next: CallHandler<Paginated<T>>,
    ): Observable<TransformedPaginatedResponse<T>> {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest<Request>();

        return next.handle().pipe(
            map((paginatedData) => {
                const endpointUrl = `${request.protocol}://${request.get('host')}${request.originalUrl.split('?')[0]}`;
                const selfUrl = `${request.protocol}://${request.get('host')}${request.originalUrl}`;

                const metadataBuilder = new MetadataResponseBuilder(
                    paginatedData,
                    request.query,
                    endpointUrl,
                    selfUrl,
                );

                const metadata: PaginationMetadata = metadataBuilder.build();

                const transformedResponse: TransformedPaginatedResponse<T> = {
                    data: paginatedData.data,
                    metadata: metadata,
                };

                return transformedResponse;
            }),
        );
    }
}
