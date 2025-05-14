import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NeighborhoodInvitationService } from '../services/neighborhood-invitation.service';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { IsSuperAdminGuard } from '../../../middleware/is-super-admin.middleware';
import {
    CreateNeighborhoodInvitationDto,
    GetNeighborhoodInvitationQueryParams,
} from './dto/neighborhood-invitation.dto';

@ApiTags('neighborhoods-invitations')
@Controller('neighborhoods-invitations')
@UseGuards(IsLoginGuard, IsSuperAdminGuard)
export class NeighborhoodInvitationController {
    constructor(private readonly neighborhoodInvitationService: NeighborhoodInvitationService) {}

    @Get(':token')
    async getInvitationByToken(@Param() param: GetNeighborhoodInvitationQueryParams) {
        return this.neighborhoodInvitationService.findInvitationByToken(param.token);
    }

    @Post()
    async createInvitation(@Body() body: CreateNeighborhoodInvitationDto, @Request() req: { user: { id: string } }) {
        return this.neighborhoodInvitationService.createInvitation({
            neighborhoodId: body.neighborhoodId,
            maxUse: body.maxUse,
            durationInDays: body.durationInDays,
            createdBy: Number(req.user.id),
        });
    }
}
