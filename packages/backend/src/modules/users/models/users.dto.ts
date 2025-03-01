import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString } from 'class-validator';

/**
 * OBJECT TYPE
 */
export class UserDto {
    @ApiProperty({ example: 1, description: 'Id of the user' })
    id!: number;

    @ApiProperty({
        example: 'John Doe',
        description: 'Full Name of the user',
    })
    fullName!: string;
}

/**
 * HTTP VALIDATION
 */
export class GetUserByIdParams {
    @ApiProperty({ example: 1, description: 'Id of the user' })
    @IsNumberString()
    id!: number;
}

export class CreateUserBody {
    @ApiProperty({
        example: 'John Doe',
        description: 'The name of the user',
    })
    @IsString()
    fullName!: string;

    @ApiProperty({
        example: 'azertyuiop',
        description: 'The password of the user',
    })
    @IsString()
    password!: string;
}
