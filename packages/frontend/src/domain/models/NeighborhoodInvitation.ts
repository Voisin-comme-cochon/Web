export interface NeighborhoodInvitation {
    id: number;
    neighborhoodId: number;
    createdBy: number;
    email: string;
    token: string;
    expiredAt?: Date;
    creationDate: Date;
}

export interface CreateMultipleInvitationsInput {
    neighborhoodId: number;
    emails: string[];
    durationInDays?: number;
}
