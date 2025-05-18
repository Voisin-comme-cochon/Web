export interface PaginatedResultModel<T> {
    data: T[];
    total: number;
    filter: {
        limit: number;
        page: number;
    }
}