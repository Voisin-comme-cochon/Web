export interface SendEmailOptions {
    to: string[];
    subject: string;
    text?: string;
    html?: string;
    template?: string;
    context?: Record<string, unknown>;
}
