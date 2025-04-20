import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
    @ApiProperty({ example: 'internal-server-error' })
    code!: string;

    @ApiProperty({ example: 500 })
    status!: number;

    @ApiProperty({ example: 'Unknown error occured' })
    message!: string;

    @ApiProperty({ example: '2021-04-02T16:39:45.930Z' })
    timestamp!: string;
}
