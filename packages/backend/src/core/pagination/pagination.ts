import { stringify } from 'querystring';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class Paging {
    @ApiProperty({
        example: 20,
        description: 'number of elements by page',
        required: false,
        default: 20,
        type: 'number',
    })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @Min(1)
    limit = 20;

    @ApiProperty({
        example: 1,
        description: 'page fetched',
        required: false,
        default: 1,
        type: 'number',
    })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @Min(1)
    page = 1;
}

export class Paginated<T> {
    data: T[];

    filters: Paging;

    total: number;

    constructor(data: T[], filters: Paging, total: number) {
        this.data = data;
        this.total = total;
        this.filters = filters;
    }
}

export interface PaginationMetadata {
    page: number;
    limit: number;
    pageCount: number;
    totalPages: number;
    totalCount: number;
    links: {
        self: string;
        previous?: string;
        next?: string;
    };
}

export class MetadataResponseBuilder {
    private readonly lastPage: number;

    constructor(
        private data: Paginated<unknown>,
        private queryParams: Record<string, unknown>,
        private endpoint: string,
        private selfUrl: string,
    ) {
        this.lastPage = Math.ceil(data.total / data.filters.limit);
    }

    build(): PaginationMetadata {
        return {
            page: this.data.filters.page,
            limit: this.data.filters.limit,
            pageCount: this.data.data.length,
            totalPages: this.lastPage,
            totalCount: this.data.total,
            links: {
                self: this.selfUrl,
                next: this.buildNextUrl(),
                previous: this.buildPreviousUrl(),
            },
        };
    }

    private buildPreviousUrl(): string | undefined {
        if (this.data.filters.page <= 1) return undefined;
        return this.buildUrl(
            this.data.filters.page - 1,
            this.data.filters.limit,
        );
    }

    private buildNextUrl(): string | undefined {
        if (this.data.filters.page >= this.lastPage) return undefined;
        return this.buildUrl(
            this.data.filters.page + 1,
            this.data.filters.limit,
        );
    }

    private buildUrl(page: number, limit: number): string {
        return `${this.endpoint}?${stringify({ ...this.queryParams, page, limit })}`;
    }
}
