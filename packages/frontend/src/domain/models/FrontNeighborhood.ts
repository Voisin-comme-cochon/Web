export interface FrontNeighborhood {
    id: number;
    name: string;
    geo: {
        type: string;
        coordinates: number[][][];
    };
    status: string;
    description: string;
    creationDate: string;
    images?: {
        id: number;
        url: string;
        isPrimary: boolean;
        neighborhoodId: string;
    }[];
}
