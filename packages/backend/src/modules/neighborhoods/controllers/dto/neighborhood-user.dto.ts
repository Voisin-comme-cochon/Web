import { ApiProperty } from '@nestjs/swagger';
import { ResponseUserDto } from '../../../users/controllers/dto/users.dto';

export class ResponseNeighborhoodUserDto extends ResponseUserDto {
    @ApiProperty({
        description: "Le rôle de l'utilisateur dans le quartier",
        example: 'admin',
        enum: ['admin', 'user'],
    })
    neighborhoodRole!: string;
}
