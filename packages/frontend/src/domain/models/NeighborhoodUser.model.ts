export interface NeighborhoodUserModel {
    id: number;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
    neighborhoodRole: string;
}

export interface NeighborhoodMemberManageModel {
    neighborhoodId: number;
    userId: number;
    firstName: string;
    lastName: string;
    neighborhoodRole: string;
    status: string;
}
