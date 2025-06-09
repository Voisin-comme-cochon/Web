export class ApiGlobalError extends Error {
    status: number;
    response: {
        data: {
            code: string;
            message: string;
            status: number;
            timestamp: string;
        };
    };

    constructor(
        status: number,
        message: string,
        response: {
            data: {
                code: string;
                message: string;
                status: number;
                timestamp: string;
            };
        }
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.response = response;
    }
}
