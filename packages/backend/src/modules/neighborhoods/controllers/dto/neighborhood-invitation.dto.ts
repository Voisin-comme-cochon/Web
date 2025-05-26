import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
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

export class CreateMultipleNeighborhoodInvitationsDto {
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
        example: ['user1@example.com', 'user2@example.com'],
        description: 'List of emails to invite to the Neighborhood',
        required: true,
        isArray: true,
        type: [String],
    })
    @IsNotEmpty()
    @IsArray()
    @IsEmail({}, { each: true })
    emails!: string[];

    @ApiProperty({
        example: 7,
        description: 'The duration in days of the invitations',
        required: false,
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    durationInDays?: number;
}

export class CreatePublicNeighborhoodInvitationDto {
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
        example: 10,
        description: 'The maximum number of times this invitation can be used',
        required: true,
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    maxUse!: number;

    @ApiProperty({
        example: 7,
        description: 'The duration in days of the invitation',
        required: false,
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    durationInDays?: number;
}

export class GetByNeiborhoodId {
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
}

export class GetNeiborhoodByUserIdDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the user',
        required: true,
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    userId!: number;
}
