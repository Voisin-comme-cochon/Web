export interface InvitationModel {
    id: number;
    neighborhoodId: number;
    createdBy: number;
    token: string;
    maxUse: number;
    usedCount: number;
    expiredAt: string;
    creationDate: string;
    invitationLink: string;
    expiresAt: string;
}
