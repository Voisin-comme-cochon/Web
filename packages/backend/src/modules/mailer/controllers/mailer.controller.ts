import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MailerService } from '../services/mailer.service';
import { SendRawEmailDto } from './dto/mailer.dto';

@ApiTags('Mailer')
@Controller('mailer')
export class MailerController {
    constructor(private readonly mailerService: MailerService) {}

    @Post('send-email')
    @ApiOperation({ summary: 'Send a raw email without template' })
    @ApiResponse({ status: 200, description: 'Email sent successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async sendEmail(@Body() dto: SendRawEmailDto): Promise<void> {
        await this.mailerService.sendRawEmail(dto);
    }
}
