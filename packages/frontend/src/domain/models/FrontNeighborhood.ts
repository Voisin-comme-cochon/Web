import { GeometryModel } from '@/domain/models/geometry.model.ts';
export interface FrontNeighborhood {
    id: number;
    name: string;
    geo: GeometryModel;
    status: string;
    description: string;
    creationDate: string;
    images?: {
        id: number;
        url: string;
        isPrimary: boolean;
        neighborhoodId: string;
    }[];
    members: {
        id: number;
        firstName: string;
        lastName: string;
        profileImageUrl: string;
        neighborhoodRole: string;
    }[];
}
