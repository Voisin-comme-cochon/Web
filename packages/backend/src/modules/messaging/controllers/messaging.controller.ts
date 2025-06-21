import { Controller, Post, Get, Body, Param, Query, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiOkResponse,
    ApiBadRequestResponse,
    ApiNotFoundResponse,
    ApiForbiddenResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginationInterceptor } from '../../../core/pagination/pagination.interceptor';
import { Paginated, Paging } from '../../../core/pagination/pagination';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { MessagingService } from '../services/messaging.service';
import {
    CreateGroupDto,
    CreatePrivateChatDto,
    SendMessageDto,
    GetMessagesDto,
    JoinGroupDto,
    GetUserGroupsDto,
    SearchUsersDto,
    GroupDto,
    GroupMessageDto,
    GroupMembershipDto,
    UserSummaryDto,
} from './dto/messaging.dto';

@ApiTags('Messaging')
@Controller('messaging')
@UseGuards(IsLoginGuard)
export class MessagingController {
    constructor(private readonly messagingService: MessagingService) {}

    // ========== GROUP MANAGEMENT ==========

    @Post('groups')
    @ApiOperation({
        summary: 'Crée un nouveau groupe',
        description: 'Permet de créer un nouveau groupe dans un quartier avec des paramètres personnalisés',
    })
    @ApiOkResponse({ description: 'Groupe crée avec succès', type: GroupDto })
    @ApiBadRequestResponse({ description: 'Données invalides' })
    @ApiForbiddenResponse({ description: 'Utilisateur non membre du quartier' })
    @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
    async createGroup(
        @Request()
        req: {
            user: { id: number };
        },
        @Body() createGroupDto: CreateGroupDto
    ): Promise<GroupDto> {
        return await this.messagingService.createGroup(req.user.id, createGroupDto);
    }

    @Post('chats/private')
    @ApiOperation({
        summary: 'Créer un chat privé',
        description: 'Crée ou récupérer un chat privé existant entre deux utilisateurs du même quartier',
    })
    @ApiOkResponse({ description: 'Chat privé créer ou récupérer avec succès', type: GroupDto })
    @ApiBadRequestResponse({ description: 'Données invalides' })
    @ApiForbiddenResponse({ description: 'Utilisateurs non membres du quartier' })
    @ApiNotFoundResponse({ description: 'Utilisateur cible non trouvé' })
    @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
    async createPrivateChat(
        @Request()
        req: {
            user: { id: number };
        },
        @Body() createPrivateChatDto: CreatePrivateChatDto
    ): Promise<GroupDto> {
        return await this.messagingService.createPrivateChat(req.user.id, createPrivateChatDto);
    }

    @Get('groups')
    @UseInterceptors(PaginationInterceptor)
    @ApiOperation({
        summary: "Récupérer les groupes de l'utilisateur",
        description: "Récupérer tous les groupes dont l'utilisateur est membre dans un quartier donné avec pagination",
    })
    @ApiOkResponse({ description: 'Liste des groupes récupérée avec succès', type: [GroupDto] })
    @ApiForbiddenResponse({ description: 'Utilisateur non membre du quartier' })
    @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
    async getUserGroups(
        @Request()
        req: {
            user: { id: number };
        },
        @Query() getUserGroupsDto: GetUserGroupsDto,
        @Query() pagination: Paging
    ): Promise<Paginated<GroupDto>> {
        const [groups, count] = await this.messagingService.getUserGroups(
            req.user.id,
            getUserGroupsDto.neighborhoodId,
            pagination.page,
            pagination.limit
        );
        return new Paginated(groups, pagination, count);
    }

    @Post('groups/join')
    @ApiOperation({
        summary: 'Rejoindre un groupe public',
        description: 'Permet à un utilisateur de rejoindre un groupe public',
    })
    @ApiOkResponse({ description: 'Groupe rejoint avec succès', type: GroupMembershipDto })
    @ApiBadRequestResponse({ description: 'Utilisateur déjà membre du groupe' })
    @ApiForbiddenResponse({ description: 'Groupe privé ou utilisateur non membre du quartier' })
    @ApiNotFoundResponse({ description: 'Groupe non trouvé' })
    @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
    async joinGroup(
        @Request()
        req: {
            user: { id: number };
        },
        @Body() joinGroupDto: JoinGroupDto
    ): Promise<GroupMembershipDto> {
        return await this.messagingService.joinGroup(req.user.id, joinGroupDto.groupId);
    }

    @Get('groups/:groupId/members')
    @ApiOperation({
        summary: "Récupérer les membres d'un groupe",
        description: "Récupére la liste des membres actifs d'un groupe (accessible uniquement aux membres)",
    })
    @ApiOkResponse({ description: 'Liste des membres récupérée avec succés', type: [GroupMembershipDto] })
    @ApiForbiddenResponse({ description: 'Accès refusé au groupe' })
    @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
    async getGroupMembers(
        @Request()
        req: {
            user: { id: number };
        },
        @Param('groupId') groupId: number
    ): Promise<GroupMembershipDto[]> {
        return await this.messagingService.getGroupMembers(req.user.id, Number(groupId));
    }

    // ========== MESSAGING ==========

    @Post('messages')
    @ApiOperation({
        summary: 'Envoyer un message',
        description: 'Envoie un message dans un groupe (accessible uniquement aux membres actifs)',
    })
    @ApiOkResponse({ description: 'Message envoyé avec succés', type: GroupMessageDto })
    @ApiBadRequestResponse({ description: 'Données invalides' })
    @ApiForbiddenResponse({ description: 'Utilisateur non membre du groupe' })
    @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
    async sendMessage(
        @Request()
        req: {
            user: { id: number };
        },
        @Body() sendMessageDto: SendMessageDto
    ): Promise<GroupMessageDto> {
        return await this.messagingService.sendMessage(req.user.id, sendMessageDto);
    }

    @Get('messages')
    @UseInterceptors(PaginationInterceptor)
    @ApiOperation({
        summary: "Récupérer les messages d'un groupe",
        description:
            "Récupérer l'historique des messages d'un groupe avec pagination (accessible uniquement aux membres)",
    })
    @ApiOkResponse({ description: 'Messages récupérés avec succès', type: [GroupMessageDto] })
    @ApiForbiddenResponse({ description: 'Accès refusé au groupe' })
    @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
    async getGroupMessages(
        @Request()
        req: {
            user: { id: number };
        },
        @Query() getMessagesDto: GetMessagesDto,
        @Query() pagination: Paging
    ): Promise<Paginated<GroupMessageDto>> {
        const [messages, count] = await this.messagingService.getGroupMessages(
            req.user.id,
            getMessagesDto.groupId,
            pagination.page,
            pagination.limit
        );
        return new Paginated(messages, pagination, count);
    }

    // ========== USER SEARCH ==========

    @Get('users/search')
    @ApiOperation({
        summary: 'Rechercher des utilisateurs dans un quartier',
        description:
            'Recherche des utilisateurs dans un quartier pour les ajouter à des groupes ou créer des chats privés',
    })
    @ApiOkResponse({ description: 'Utilisateurs trouvés avec succès', type: [UserSummaryDto] })
    @ApiForbiddenResponse({ description: 'Utilisateur non membre du quartier' })
    @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
    async searchUsersInNeighborhood(
        @Request()
        req: {
            user: { id: number };
        },
        @Query() searchUsersDto: SearchUsersDto
    ): Promise<UserSummaryDto[]> {
        return await this.messagingService.searchUsersInNeighborhood(
            req.user.id,
            searchUsersDto.neighborhoodId,
            searchUsersDto.search
        );
    }
}
