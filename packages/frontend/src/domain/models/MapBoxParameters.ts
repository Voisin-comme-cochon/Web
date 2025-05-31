import { MapBoxGeoJson } from '@/domain/models/MapBoxGeoJson.ts';

export interface MapBoxParameters {
    canCreate: boolean;
    showDetails: boolean;
    onGeoSelect?: (geo: { type: string; coordinates: number[][][] }) => void;
    specificNeighborhood?: MapBoxGeoJson[];
    centerOnNeighborhood?: boolean;
}
