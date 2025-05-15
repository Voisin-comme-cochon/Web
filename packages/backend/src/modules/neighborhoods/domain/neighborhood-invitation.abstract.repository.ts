import { NeighborhoodInvitation, NeighborhoodInvitationCreation } from './neighborhood-invitation.model';

export abstract class NeighborhoodInvitationRepository {
    abstract insertInvitation(invitation: NeighborhoodInvitationCreation): Promise<NeighborhoodInvitation>;

    abstract findInvitationByToken(token: string): Promise<NeighborhoodInvitation | null>;
}
