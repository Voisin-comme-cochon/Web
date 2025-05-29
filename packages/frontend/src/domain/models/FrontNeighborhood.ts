import { GeometryModel } from '@/domain/models/geometry.model.ts';

export interface FrontNeighborhood {
    id: number;
    name: string;
    geo: GeometryModel;
    status: string;
    description: string;
    creationDate: string;
}
