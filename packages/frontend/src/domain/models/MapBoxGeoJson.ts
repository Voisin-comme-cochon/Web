export interface MapBoxGeoJson {
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
