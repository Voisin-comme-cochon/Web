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
}
