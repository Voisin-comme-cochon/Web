import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetNeighborhoodInvitationQueryParams {
    @ApiProperty({
        example: 'jwttoken',
        description: 'The jwt token of the invitation',
        required: true,
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    token!: string;
}

export class CreateNeighborhoodInvitationDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the Neighborhood',
        required: true,
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    neighborhoodId!: number;

    @ApiProperty({
        example: '10',
        description: 'The max use of the invitation',
        required: true,
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    maxUse?: number;

    @ApiProperty({
        example: '10',
        description: 'The duration in days of the invitation',
        required: true,
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    durationInDays?: number;

    @ApiProperty({
        example: 'user@gmail.com',
        description: 'The email of the user to invite',
        required: true,
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    email?: string;
}
