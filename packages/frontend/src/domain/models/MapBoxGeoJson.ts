export interface MapBoxGeoJson {
    type: 'FeatureCollection';
    features: Array<{
        type: 'Feature';
        geometry: {
            type: string;
            coordinates: number[][][];
        };
        properties: {
            id: number;
            name: string;
            description: string;
            color: string;
        };
    }>;
}