import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsBoolean, IsInt } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { GroupType } from '../../domain/group.model';
import { MembershipStatus } from '../../domain/group-membership.model';

// ========== CREATE GROUP DTOs ==========
export class CreateGroupDto {
    @ApiProperty({ example: 'Groupe des amateurs de jardinage', description: 'Nom du groupe' })
    @IsString()
    name!: string;

    @ApiProperty({ example: 'Partageons nos astuces de jardinage', description: 'Description du groupe' })
    @IsString()
    description!: string;

    @ApiProperty({
        enum: GroupType,
        example: GroupType.PUBLIC,
        description: 'Type du groupe',
    })
    @IsEnum(GroupType)
    type!: GroupType;

    @ApiProperty({ example: true, description: 'Groupe privé ou public' })
    @IsBoolean()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return Boolean(value);
    })
    isPrivate!: boolean;

    @ApiProperty({ example: 1, description: 'ID du quartier' })
    @IsInt()
    @Type(() => Number)
    neighborhoodId!: number;

    @ApiProperty({ example: 1, description: 'ID du tag associé', required: false })
    @IsInt()
    @Type(() => Number)
    @IsOptional()
    tagId?: number;

    @ApiProperty({
        example: [2, 3],
        description: 'IDs des membres à ajouter au groupe',
        required: false,
        type: [Number],
    })
    @IsArray()
    @IsInt({ each: true })
    @Type(() => Number)
    @IsOptional()
    memberIds?: number[];

    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'Image du groupe (optionnel)',
        required: false,
    })
    @IsOptional()
    groupImage?: Express.Multer.File;
}

export class UpdateGroupDto {
    @ApiProperty({ example: 'Nouveau nom du groupe', description: 'Nom du groupe', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 'Nouvelle description', description: 'Description du groupe', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        enum: GroupType,
        example: GroupType.PUBLIC,
        description: 'Type du groupe',
        required: false,
    })
    @IsEnum(GroupType)
    @IsOptional()
    type?: GroupType;

    @ApiProperty({ example: false, description: 'Groupe privé ou public', required: false })
    @IsBoolean()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return Boolean(value);
    })
    @IsOptional()
    isPrivate?: boolean;

    @ApiProperty({ example: 2, description: 'ID du tag associé', required: false })
    @IsInt()
    @Type(() => Number)
    @IsOptional()
    tagId?: number;

    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'Image du groupe (optionnel)',
        required: false,
    })
    @IsOptional()
    groupImage?: any;
}

export class CreatePrivateChatDto {
    @ApiProperty({ example: 2, description: 'ID de la personne avec qui créer le chat privé' })
    @IsInt()
    @Type(() => Number)
    targetUserId!: number;

    @ApiProperty({ example: 1, description: 'ID du quartier' })
    @IsInt()
    @Type(() => Number)
    neighborhoodId!: number;
}

// ========== MESSAGE DTOs ==========
export class SendMessageDto {
    @ApiProperty({ example: 'Salut tout le monde !', description: 'Contenu du message' })
    @IsString()
    content!: string;

    @ApiProperty({ example: 1, description: 'ID du groupe' })
    @IsInt()
    @Type(() => Number)
    groupId!: number;
}

export class GetMessagesDto {
    @ApiProperty({ example: 1, description: 'ID du groupe' })
    @IsInt()
    @Type(() => Number)
    groupId!: number;
}

// ========== GROUP MANAGEMENT DTOs ==========
export class ByGroupDto {
    @ApiProperty({ example: 1, description: 'ID du groupe' })
    @IsInt()
    @Type(() => Number)
    groupId!: number;
}

export class InviteToGroupDto {
    @ApiProperty({ example: 1, description: 'ID du groupe sur lequel inviter la personne' })
    @IsInt()
    @Type(() => Number)
    groupId!: number;

    @ApiProperty({
        example: [2, 3],
        description: 'IDs des utilisateurs à inviter',
        type: [Number],
    })
    @IsArray()
    @IsInt({ each: true })
    @Type(() => Number)
    userIds!: number[];
}

export class GetByNeighborhoodIdDto {
    @ApiProperty({ example: 1, description: 'ID du quartier' })
    @IsInt()
    @Type(() => Number)
    neighborhoodId!: number;
}

export class GetGroupMembersDto {
    @ApiProperty({ example: 1, description: 'ID du groupe' })
    @IsInt()
    @Type(() => Number)
    groupId!: number;
}

export class GetUserGroupsDto {
    @ApiProperty({ example: 1, description: 'ID du quartier' })
    @IsInt()
    @Type(() => Number)
    neighborhoodId!: number;
}

export class SearchUsersDto {
    @ApiProperty({ example: 1, description: 'ID du quartier' })
    @IsInt()
    @Type(() => Number)
    neighborhoodId!: number;

    @ApiProperty({
        example: 'Jean',
        description: 'Terme de recherche (nom/prénom)',
        required: false,
    })
    @IsString()
    @IsOptional()
    search?: string;
}

// ========== RESPONSE DTOs ==========
export class UserSummaryDto {
    @ApiProperty({ example: 1, description: "ID de l'utilisateur" })
    id!: number;

    @ApiProperty({ example: 'Jean', description: 'Prénom' })
    firstName!: string;

    @ApiProperty({ example: 'Dupont', description: 'Nom de famille' })
    lastName!: string;

    @ApiProperty({ example: 'https://example.com/avatar.jpg', description: "URL de l'avatar", required: false })
    profileImageUrl?: string;
}

export class GroupMessageDto {
    @ApiProperty({ example: 1, description: 'ID du message' })
    id!: number;

    @ApiProperty({ example: 'Salut tout le monde !', description: 'Contenu du message' })
    content!: string;

    @ApiProperty({ example: 1, description: "ID de l'utilisateur auteur" })
    userId!: number;

    @ApiProperty({ example: 1, description: 'ID du groupe' })
    groupId!: number;

    @ApiProperty({ example: '2024-01-01T12:00:00Z', description: 'Date de création' })
    createdAt!: Date;

    @ApiProperty({ description: "Informations sur l'utilisateur auteur", required: false })
    user?: UserSummaryDto;
}

export class GroupDto {
    @ApiProperty({ example: 1, description: 'ID du groupe' })
    id!: number;

    @ApiProperty({ example: 'Groupe des amateurs de jardinage', description: 'Nom du groupe' })
    name!: string;

    @ApiProperty({ example: 'Partageons nos astuces de jardinage', description: 'Description du groupe' })
    description!: string;

    @ApiProperty({ enum: GroupType, example: GroupType.PUBLIC, description: 'Type du groupe' })
    type!: GroupType;

    @ApiProperty({ example: true, description: 'Groupe privé ou public' })
    isPrivate!: boolean;

    @ApiProperty({ example: 1, description: 'ID du quartier' })
    neighborhoodId!: number;

    @ApiProperty({ example: 1, description: 'ID du tag associé', required: false })
    tagId?: number;

    @ApiProperty({
        example: 'https://example.com/group-image.jpg',
        description: "URL de l'image du groupe",
        required: false,
    })
    imageUrl?: string;

    @ApiProperty({ example: '2024-01-01T12:00:00Z', description: 'Date de création' })
    createdAt!: Date;

    @ApiProperty({ example: 5, description: 'Nombre de membres', required: false })
    memberCount?: number;

    @ApiProperty({ description: 'Dernier message du groupe', required: false })
    lastMessage?: GroupMessageDto;
}

export class GroupMembershipDto {
    @ApiProperty({ example: 1, description: 'ID du membership' })
    id!: number;

    @ApiProperty({ example: 1, description: "ID de l'utilisateur" })
    userId!: number;

    @ApiProperty({ example: 1, description: 'ID du groupe' })
    groupId!: number;

    @ApiProperty({
        enum: MembershipStatus,
        example: MembershipStatus.ACTIVE,
        description: 'Statut du membership',
    })
    status!: MembershipStatus;

    @ApiProperty({
        example: false,
        description: 'Indique si cet utilisateur est le propriétaire du groupe',
    })
    isOwner!: boolean;

    @ApiProperty({ description: "Informations sur l'utilisateur", required: false })
    user?: UserSummaryDto;
}

export class CountMessagesDto {
    @ApiProperty({ example: 10, description: "Nombre total de messages sur l'application" })
    count!: number;
}
