import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JavaService } from '../services/java.service';
import { JavaDto } from '../dto/java-version.dto';

@ApiTags('Java')
@Controller('java')
export class JavaController {
    constructor(private readonly javaService: JavaService) {}

    @Get('version')
    @ApiOperation({ summary: 'Récupérer la dernière version de Java' })
    @ApiResponse({
        status: 200,
        description: 'La dernière version de Java',
        type: JavaDto
    })
    @ApiResponse({
        status: 404,
        description: 'Aucune version Java trouvée'
    })
    public async getCurrentVersion(): Promise<JavaDto> {
        return await this.javaService.getCurrentVersion();
    }
}
