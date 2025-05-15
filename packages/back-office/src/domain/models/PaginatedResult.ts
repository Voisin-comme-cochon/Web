export interface PaginatedResult<T> {
    data: T[];
    total: number;
    filter: {
        limit: number;
        page: number;
    }
}