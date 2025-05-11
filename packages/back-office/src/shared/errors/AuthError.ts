export class AuthError extends Error {
    description: string;

    constructor(message: string, error?: Error, description = 'Unknown error occurred') {
        super(message);
        this.name = 'AuthError';
        this.description = description;
        this.stack = error?.stack;
    }
}