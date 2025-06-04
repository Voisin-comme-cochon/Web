import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ResponseNeighborhoodDto } from './neighborhood.dto';

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

export class NeighborhoodMemberDto {
    @ApiProperty({
        example: 1,
        description: "L'id de l'utilisateur",
    })
    id!: number;

    @ApiProperty({
        example: 'Jean',
        description: "Le prénom de l'utilisateur",
    })
    firstName!: string;

    @ApiProperty({
        example: 'Dupont',
        description: "Le nom de famille de l'utilisateur",
    })
    lastName!: string;

    @ApiProperty({
        example: 'https://example.com/profile.jpg',
        description: "L'URL de l'image de profil",
        required: false,
    })
    profileImageUrl?: string;

    @ApiProperty({
        description: "Le rôle de l'utilisateur dans le quartier",
        example: 'admin',
        enum: ['admin', 'user'],
    })
    neighborhoodRole!: string;
}

export class ResponseNeighborhoodWithMembersDto extends ResponseNeighborhoodDto {
    @ApiProperty({
        type: [NeighborhoodMemberDto],
        description: 'La liste des membres du quartier',
    })
    members!: NeighborhoodMemberDto[];
}
