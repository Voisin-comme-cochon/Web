export interface MapBoxParameters {
    canCreate: boolean;
    showDetails: boolean;
    onGeoSelect?: (geo: { type: string; coordinates: number[][][] }) => void;
}
