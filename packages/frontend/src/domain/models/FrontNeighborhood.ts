import { MapBoxGeoJson } from '@/domain/models/MapBoxGeoJson.ts';

export interface FrontNeighborhood {
    id: number;
    name: string;
    geo: MapBoxGeoJson;
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
