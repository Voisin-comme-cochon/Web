import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NeighborhoodInvitationService } from '../services/neighborhood-invitation.service';

@ApiTags('neighborhoods-invitations')
@Controller('neighborhoods-invitations')
export class NeighborhoodInvitationController {
    constructor(private readonly neighborhoodInvitationService: NeighborhoodInvitationService) {}
}
