import dayjs from 'dayjs';

export class CochonError extends Error {
    public readonly date: string;

    public readonly code: string;

    public readonly message: string;

    public readonly status: number;

    public readonly context: Record<string, unknown>;

    constructor(code: string, message: string, status?: number, context?: Record<string, unknown>) {
        super(message);

        this.date = dayjs().format('YYYY-MM-DD[T]HH:mm:ssZ');

        // we check if an error has been passed in the context => allow JSON.stringify to work correctly render the error's message
        if (context) {
            for (const key of Object.keys(context)) {
                if (context[key] instanceof Error) {
                    context[key] = {
                        // eslint-disable-next-line @typescript-eslint/no-misused-spread
                        ...context[key],
                        message: context[key].message,
                        name: context[key].name,
                        stack: context[key].stack,
                    };
                }
            }
        }

        this.message = message;
        this.code = code;
        this.status = status ?? 500;
        this.context = context ?? {};

        Error.captureStackTrace(this, CochonError);
    }

    public toJSON(): CochonErrorJson {
        return {
            code: this.code,
            message: this.message,
            status: this.status,
            context: this.context,
            stack: this.stack,
            date: this.date,
        };
    }
}

export interface CochonErrorJson {
    code: string;
    message: string;
    status: number;
    context: Record<string, unknown>;
    stack?: string;
    date: string;
}
