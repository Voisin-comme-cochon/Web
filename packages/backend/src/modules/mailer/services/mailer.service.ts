import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { SendEmailOptions } from '../domain/mailer.interface';
import { templateParameters, Templates } from '../domain/templates.enum';
import { CochonError } from '../../../utils/CochonError';

@Injectable()
export class MailerService {
    constructor(private readonly mailerService: NestMailerService) {}

    /**
     * Send an email
     * @param options SendMailOptions
     * @returns Promise<void>
     * @throws CochonError if the email fails to send
     * @throws CochonError if one of the required parameters is missing or invalid
     */
    async sendRawEmail(options: SendEmailOptions): Promise<{ message: string }> {
        if (options.template && !options.context) {
            throw new CochonError('missing_template_context', 'Context is required when using a template', 400);
        }

        if (options.context && !options.template) {
            throw new CochonError('missing_template', 'Template is required when providing context', 400);
        }

        if (options.template && (options.html || options.text)) {
            throw new CochonError('invalid_template_usage', 'Cannot specify html or text when using a template', 400);
        }

        if (options.html && options.template) {
            throw new CochonError('invalid_html_usage', 'Cannot use template when providing html content', 400);
        }

        if (options.template) {
            this.validateTemplateContext(options.template as Templates, options.context);
        }

        try {
            await this.mailerService.sendMail(options);
            return {
                message: 'Email sent successfully',
            };
        } catch (error) {
            throw new CochonError('email_send_failed', 'Failed to send email', 500, { error });
        }
    }

    /**
     * Validates that the context matches the expected parameters for the template
     * @param template The template to validate against
     * @param context The context to validate
     * @throws CochonError if the context doesn't match the template
     */
    private validateTemplateContext(template: Templates, context?: Record<string, unknown>): void {
        if (!context) {
            throw new CochonError('missing_template_context', `Context is required for template ${template}`, 400);
        }

        const requiredKeys = templateParameters[template];

        for (const key of requiredKeys) {
            if (!(key in context)) {
                throw new CochonError(
                    'missing_requirer_parameter_template',
                    `Missing required parameter '${key}' for template ${template}`,
                    400
                );
            }
        }
    }
}
