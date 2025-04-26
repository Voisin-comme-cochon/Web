import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { MailerService } from './services/mailer.service';
import { MailerController } from './controllers/mailer.controller';

@Module({
    imports: [
        NestMailerModule.forRoot({
            transport: {
                host: process.env.VCC_MAIL_HOST,
                port: Number(process.env.VCC_MAIL_PORT),
                secure: process.env.VCC_MAIL_SECURE === 'true',
                auth: {
                    user: process.env.VCC_MAIL_USER,
                    pass: process.env.VCC_MAIL_PASSWORD,
                },
            },
            defaults: {
                from: process.env.VCC_MAIL_FROM,
            },
        }),
    ],
    controllers: [MailerController],
    providers: [MailerService],
    exports: [MailerService],
})
export class MailerModule {}
