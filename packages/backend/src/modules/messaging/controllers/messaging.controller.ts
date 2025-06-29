import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Request,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginationInterceptor } from '../../../core/pagination/pagination.interceptor';
import { Paginated, Paging } from '../../../core/pagination/pagination';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { MessagingService } from '../services/messaging.service';
import { IsSuperAdminGuard } from '../../../middleware/is-super-admin.middleware';
import { GroupMembershipAdapter } from '../adapters/group-membership.adapter';
import {
    CountMessagesDto,
    CreateGroupDto,
    CreatePrivateChatDto,
    GetByNeighborhoodIdDto,
    GetMessagesDto,
    GetUserGroupsDto,
    GroupDto,
    GroupMembershipDto,
    GroupMessageDto,
    InviteToGroupDto,
    ByGroupDto,
    SearchUsersDto,
    SendMessageDto,
    UpdateGroupDto,
    UserSummaryDto,
} from './dto/messaging.dto';

@ApiTags('Messaging')
@ApiBearerAuth()
@Controller('messaging')
@UseGuards(IsLoginGuard)
export class MessagingController {
    constructor(private readonly messagingService: MessagingService) { }

    // ========== GROUP MANAGEMENT ==========

    @Post('groups')
    @UseInterceptors(FileInterceptor('groupImage'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: 'Crée un nouveau groupe',
        description:
            'Permet de créer un nouveau groupe dans un quartier avec des paramètres personnalisés et une image optionnelle',
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
        @Body() createGroupDto: CreateGroupDto,
        @UploadedFile() groupImage?: Express.Multer.File
    ): Promise<GroupDto> {
        const { memberIds, ...groupData } = createGroupDto;

        return await this.messagingService.createGroup(req.user.id, groupData, {
            memberIds,
            groupImage,
        });
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
        return await this.messagingService.createPrivateChat(
            req.user.id,
            createPrivateChatDto.targetUserId,
            createPrivateChatDto.neighborhoodId
        );
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
        summary: 'Rejoindre un groupe public ou privée si invité',
        description: 'Permet à un utilisateur de rejoindre un groupe public ou privé s’il a été invité',
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
        @Body() joinGroupDto: ByGroupDto
    ): Promise<GroupMembershipDto> {
        return await this.messagingService.joinGroup(req.user.id, joinGroupDto.groupId);
    }

    @Post('groups/decline')
    @ApiOperation({
        summary: 'Décliner une invitation de groupe',
        description: 'Permet à un utilisateur de décliner une invitation à rejoindre un groupe',
    })
    @ApiOkResponse({ description: 'Invitation déclinée avec succès' })
    @ApiBadRequestResponse({ description: "L'invitation n'est pas en attente" })
    @ApiForbiddenResponse({ description: 'Utilisateur non membre du quartier' })
    @ApiNotFoundResponse({ description: 'Groupe non trouvé ou aucune invitation trouvée' })
    @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
    async declineGroupInvitation(
        @Request()
        req: {
            user: { id: number };
        },
        @Body() declineGroupDto: ByGroupDto
    ): Promise<{ success: boolean }> {
        return await this.messagingService.declineGroupInvitation(req.user.id, declineGroupDto.groupId);
    }

    @Post('groups/leave')
    @ApiOperation({
        summary: 'Quitter un groupe',
        description: 'Permet à un utilisateur de quitter un groupe (public ou privé) dont il est membre',
    })
    @ApiOkResponse({ description: 'Groupe quitté avec succès', type: 'object' })
    @ApiBadRequestResponse({ description: 'Utilisateur non membre du groupe' })
    @ApiForbiddenResponse({ description: "Le propriétaire ne peut pas quitter le groupe avec d'autres membres" })
    @ApiNotFoundResponse({ description: 'Groupe non trouvé' })
    @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
    async leaveGroup(
        @Request()
        req: {
            user: { id: number };
        },
        @Body() leaveGroupDto: ByGroupDto
    ): Promise<{ success: boolean; newOwnerId?: number; groupDeleted?: boolean }> {
        return await this.messagingService.leaveGroup(req.user.id, leaveGroupDto.groupId);
    }

    @Patch('groups/:groupId')
    @UseInterceptors(FileInterceptor('groupImage'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: 'Modifier un groupe',
        description:
            "Permet au propriétaire de modifier les informations d'un groupe (nom, description, type, tag, image)",
    })
    @ApiOkResponse({ description: 'Groupe modifié avec succès', type: GroupDto })
    @ApiBadRequestResponse({ description: 'Données invalides' })
    @ApiForbiddenResponse({ description: 'Seul le propriétaire peut modifier le groupe' })
    @ApiNotFoundResponse({ description: 'Groupe non trouvé' })
    @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
    async updateGroup(
        @Request()
        req: {
            user: { id: number };
        },
        @Param() params: ByGroupDto,
        @Body() updateGroupDto: UpdateGroupDto,
        @UploadedFile() groupImage?: Express.Multer.File
    ): Promise<GroupDto> {
        return await this.messagingService.updateGroup(req.user.id, params.groupId, updateGroupDto, {
            groupImage,
        });
    }

    @Delete('groups/:groupId')
    @ApiOperation({
        summary: 'Supprimer un groupe',
        description: 'Permet au propriétaire de supprimer définitivement un groupe et toutes ses données associées',
    })
    @ApiOkResponse({ description: 'Groupe supprimé avec succès' })
    @ApiForbiddenResponse({ description: 'Seul le propriétaire peut supprimer le groupe' })
    @ApiNotFoundResponse({ description: 'Groupe non trouvé' })
    @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
    async deleteGroup(
        @Request()
        req: {
            user: { id: number };
        },
        @Param() params: ByGroupDto
    ): Promise<{ success: boolean }> {
        return await this.messagingService.deleteGroup(req.user.id, params.groupId);
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

    @Get('groups/available-groups')
    @ApiOperation({
        summary: 'Récupérer les groupes disponibles',
        description: 'Récupère la liste des groupes publics disponibles dans le quartier de l’utilisateur',
    })
    @ApiOkResponse({ description: 'Liste des groupes récupérée avec succès', type: [GroupDto] })
    @ApiForbiddenResponse({ description: 'Utilisateur non membre du quartier' })
    @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
    async getAvailableGroups(
        @Request()
        req: {
            user: { id: number };
        },
        @Query() query: GetByNeighborhoodIdDto
    ): Promise<GroupDto[]> {
        return await this.messagingService.getAvailableGroups(req.user.id, Number(query.neighborhoodId));
    }

    @Get('groups/invite')
    @ApiOperation({
        summary: 'Récupérer les invitations de groupes',
        description: "Récupère tous les groupes pour lesquels l'utilisateur a des invitations en attente",
    })
    @ApiOkResponse({ description: 'Liste des groupes avec invitations récupérée avec succès', type: [GroupDto] })
    @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
    async getGroupInvitations(
        @Request()
        req: {
            user: { id: number };
        }
    ): Promise<GroupDto[]> {
        return await this.messagingService.getGroupInvitations(req.user.id);
    }

    @Post('groups/invite')
    @ApiOperation({
        summary: 'Inviter des utilisateurs à un groupe',
        description: 'Permet d’inviter plusieurs utilisateurs à rejoindre un groupe',
    })
    @ApiOkResponse({ description: 'Invitations envoyées avec succès', type: [GroupMembershipDto] })
    @ApiBadRequestResponse({ description: 'Données invalides' })
    @ApiForbiddenResponse({ description: 'Utilisateur non membre du groupe ou du quartier' })
    @ApiNotFoundResponse({ description: 'Groupe non trouvé' })
    @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
    async inviteToGroup(
        @Request()
        req: {
            user: { id: number };
        },
        @Body() inviteToGroupDto: InviteToGroupDto
    ): Promise<{ success: boolean }> {
        await this.messagingService.inviteToGroup(
            req.user.id,
            GroupMembershipAdapter.inviteDtoToDomain(inviteToGroupDto)
        );

        return { success: true };
    }

    // ========== MEMBERS MANAGEMENT ==========

    @Delete('groups/members/:membershipId')
    @ApiOperation({
        summary: 'Supprimer un membre d’un groupe',
        description: 'Permet de supprimer un membre d’un groupe',
    })
    @ApiOkResponse({ description: 'Membre supprimé avec succès' })
    @ApiBadRequestResponse({ description: 'Données invalides' })
    @ApiForbiddenResponse({ description: 'Utilisateur non membre du groupe ou du quartier' })
    @ApiNotFoundResponse({ description: 'Groupe non trouvé' })
    @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
    async removeMember(
        @Request() req: { user: { id: number } },
        @Param('membershipId') membershipId: number
    ): Promise<{ success: boolean }> {
        return await this.messagingService.removeMember(req.user.id, Number(membershipId));
    }

    // ========== INVITATIONS ==========

    @Delete('groups/invitations/:membershipId')
    @ApiOperation({
        summary: 'Révoquer une invitation',
        description: 'Permet de révoquer une invitation',
    })
    @ApiOkResponse({ description: 'Invitation révoquée avec succès' })
    @ApiBadRequestResponse({ description: 'Données invalides' })
    @ApiForbiddenResponse({ description: 'Utilisateur non membre du groupe ou du quartier' })
    @ApiNotFoundResponse({ description: 'Groupe non trouvé' })
    @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
    async revokeInvitation(
        @Request() req: { user: { id: number } },
        @Param('membershipId') membershipId: number
    ): Promise<{ success: boolean }> {
        return await this.messagingService.revokeInvitation(req.user.id, Number(membershipId));
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
        return await this.messagingService.sendMessage(req.user.id, sendMessageDto.content, sendMessageDto.groupId);
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

    @Get('messages/count')
    @ApiOperation({
        summary: 'Récupérer le nombre total de messages',
        description: 'Récupère le nombre total de messages dans la base de données',
    })
    @ApiOkResponse({ description: 'Nombre de messages récupéré avec succès', type: CountMessagesDto })
    @ApiUnauthorizedResponse({ description: 'Token JWT manquant ou invalide' })
    @UseGuards(IsSuperAdminGuard)
    async getAmountOfMessage(): Promise<CountMessagesDto> {
        return {
            count: await this.messagingService.getAmountOfMessage(),
        };
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
