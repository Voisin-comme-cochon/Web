export interface MapBoxGeoJson {
    geometry: {
        type: string;
        coordinates: number[][][] | number[];
    };
    properties: {
        id: number;
        name: string;
        description: string;
        color: string;
        creationDate: Date;
    };
}
