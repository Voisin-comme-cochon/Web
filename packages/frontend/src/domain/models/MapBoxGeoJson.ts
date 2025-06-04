import { GeometryModel } from '@/domain/models/geometry.model.ts';

export interface MapBoxGeoJson {
    geometry: GeometryModel;
    type: string;
    coordinates: number[][][];
    properties: {
        id: number;
        name: string;
        description: string;
        color: string;
        creationDate: Date;
    };
}
