import dayjs from 'dayjs';

export class CochonError extends Error {
    public readonly date: string;

    public readonly code: string;

    public readonly message: string;

    public readonly status: number;

    public readonly context?: Record<string, unknown>;

    constructor(code: string, message: string, status?: number, context?: Record<string, unknown>) {
        super(message);

        this.date = dayjs().format('YYYY-MM-DD[T]HH:mm:ssZ');

        this.message = message;
        this.code = code;
        this.status = status ?? 500;
        this.context = context;

        Error.captureStackTrace(this, CochonError);
    }

    public toJSON(): CochonErrorJson {
        return {
            code: this.code,
            message: this.message,
            status: this.status,
            stack: this.stack,
            date: this.date,
        };
    }
}

export interface CochonErrorJson {
    code: string;
    message: string;
    status: number;
    stack?: string;
    date: string;
}
