import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { SendMailOptions } from '../domain/mailer.interface';

@Injectable()
export class MailerService {
    constructor(private readonly mailerService: NestMailerService) {}

    /**
     * Send an email
     * @param options SendMailOptions
     * @returns Promise<void>
     */
    async sendMail(options: SendMailOptions): Promise<void> {
        try {
            await this.mailerService.sendMail({
                bcc: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
                template: options.template,
                context: options.context,
                from: 'Voisin comme cochon',
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error sending email:', error);
                throw new Error(`Failed to send email: ${error.message}`);
            }
        }
    }
}
