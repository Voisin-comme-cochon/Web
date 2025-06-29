import React, { useMemo } from 'react';
import Map, { Layer, Source } from 'react-map-gl/mapbox';

export interface GeometryModel {
    type: string;
    coordinates: number[][] | number[][][] | number[][][][];
}

interface ViewNeighborhoodMapBoxProps {
    geometry: GeometryModel;
    mapboxAccessToken?: string;
}

const ViewNeighborhoodMapBox: React.FC<ViewNeighborhoodMapBoxProps> = ({
    geometry,
    mapboxAccessToken = import.meta.env.VITE_VCC_MAPBOX_PUBLIC_KEY || '',
}) => {
    const initialViewState = useMemo(() => {
        let coords: [number, number][] = [];

        if (geometry.type === 'Polygon') {
            coords = (geometry.coordinates as number[][][])[0] as [number, number][];
        }

        if (coords.length === 0) {
            coords = [[0, 0]];
        }

        const lons = coords.map((c) => c[0]);
        const lats = coords.map((c) => c[1]);
        const sw: [number, number] = [Math.min(...lons), Math.min(...lats)];
        const ne: [number, number] = [Math.max(...lons), Math.max(...lats)];
        const center: [number, number] = [(sw[0] + ne[0]) / 2, (sw[1] + ne[1]) / 2];

        return {
            longitude: center[0],
            latitude: center[1],
            zoom: 14,
        };
    }, [geometry]);

    return (
        <Map
            initialViewState={initialViewState}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            mapboxAccessToken={mapboxAccessToken}
            style={{ width: '100%', height: '100%' }}
        >
            <Source id="neighborhood" type="geojson" data={{ type: 'Feature', geometry }}>
                <Layer
                    id="neighborhood-fill"
                    type="fill"
                    paint={{
                        'fill-color': '#E56343',
                        'fill-opacity': 0.5,
                    }}
                />
                <Layer
                    id="neighborhood-border"
                    type="line"
                    paint={{
                        'line-color': '#E56343',
                        'line-width': 2,
                    }}
                />
            </Source>
        </Map>
    );
};

export default ViewNeighborhoodMapBox;
