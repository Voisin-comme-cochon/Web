import { NeighborhoodInvitation, NeighborhoodInvitationCreation } from './neighborhood-invitation.model';

export abstract class NeighborhoodInvitationRepository {
    abstract insertInvitation(invitation: NeighborhoodInvitationCreation): Promise<NeighborhoodInvitation>;

    abstract findInvitationByToken(token: string): Promise<NeighborhoodInvitation | null>;

    abstract incrementInvitationUsage(token: string): Promise<void>;

    abstract getInvitationsByNeighborhoodId(neighborhoodId: number): Promise<NeighborhoodInvitation[]>;
}
