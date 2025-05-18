export interface PaginatedResultModel<T> {
    data: T[];
    metadata: {
        page: number;
        limit: number;
        pageCount: number;
        totalPages: number;
        totalCount: number;
        links: {
            self: string;
            next: string | null;
            previous: string | null;
        }
    }
}