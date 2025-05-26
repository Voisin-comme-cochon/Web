export interface NeighborhoodInvitation {
    id: number;
    neighborhoodId: number;
    createdBy: number;
    token: string;
    maxUse?: number;
    usedCount?: number;
    expiredAt: Date;
    creationDate: Date;
}

export interface NeighborhoodInvitationCreation {
    neighborhoodId: number;
    createdBy: number;
    maxUse?: number;
    durationInDays?: number;
    token?: string;
    expiredAt?: Date;
    email?: string;
}

export interface CreateMultipleInvitationsInput {
    neighborhoodId: number;
    emails: string[];
    createdBy: number;
    durationInDays?: number;
}

export interface CreatePublicInvitationInput {
    neighborhoodId: number;
    createdBy: number;
    maxUse: number;
    durationInDays?: number;
}
