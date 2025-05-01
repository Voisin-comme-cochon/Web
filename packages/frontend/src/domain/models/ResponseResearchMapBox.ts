import { MapBoxGeoJson } from '@/domain/models/MapBoxGeoJson.ts';

export interface ResponseResearchMapBox {
    attibution: string;
    features: MapBoxGeoJson[];
    type: string;
    url: string;
}
