import { NeighborhoodInvitation, NeighborhoodInvitationCreation } from './neighborhood-invitation.model';

export abstract class NeighborhoodInvitationRepository {
    abstract insertInvitation(invitation: NeighborhoodInvitationCreation): Promise<NeighborhoodInvitation>;

    abstract getInvitationById(id: number): Promise<NeighborhoodInvitation | null>;

    abstract deleteInvitation(invitationId: number): Promise<void>;

    abstract findInvitationByToken(token: string): Promise<NeighborhoodInvitation | null>;

    abstract incrementInvitationUsage(token: string): Promise<void>;

    abstract getInvitationsByNeighborhoodId(neighborhoodId: number): Promise<NeighborhoodInvitation[]>;
}
