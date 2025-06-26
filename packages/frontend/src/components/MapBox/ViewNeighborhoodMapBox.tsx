import React, { useMemo, useState } from 'react';
import Map, { Layer, Source } from 'react-map-gl/mapbox';

export interface GeometryModel {
    type: string;
    coordinates: number[][] | number[][][];
}

interface ViewNeighborhoodMapBoxProps {
    geometry: GeometryModel;
    mapboxAccessToken?: string;
}

const ViewNeighborhoodMapBox: React.FC<ViewNeighborhoodMapBoxProps> = ({
    geometry,
    mapboxAccessToken = import.meta.env.VITE_VCC_MAPBOX_PUBLIC_KEY || '',
}) => {
    const { initialViewState } = useMemo(() => {
        let coords: [number, number][] = [];
        if (geometry.type === 'Polygon') {
            coords = (geometry.coordinates as number[][][])[0] as [number, number][];
        }

        const lons = coords.map((c) => c[0]);
        const lats = coords.map((c) => c[1]);
        const sw = [Math.min(...lons), Math.min(...lats)] as [number, number];
        const ne = [Math.max(...lons), Math.max(...lats)] as [number, number];

        const center: [number, number] = [(sw[0] + ne[0]) / 2, (sw[1] + ne[1]) / 2];

        return {
            initialViewState: {
                longitude: center[0],
                latitude: center[1],
                zoom: 11,
            },
        };
    }, [geometry]);

    const [viewState, setViewState] = useState(initialViewState);

    return (
        <Map
            viewState={viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            mapboxAccessToken={mapboxAccessToken}
            style={{ width: '100%', height: '100%' }}
        >
            <Source id="neighborhood" type="geojson" data={{ type: 'Feature', geometry }}>
                <Layer id="neighborhood-fill" type="fill" paint={{ 'fill-color': '#E56343', 'fill-opacity': 0.5 }} />
                <Layer id="neighborhood-border" type="line" paint={{ 'line-color': '#E56343', 'line-width': 2 }} />
            </Source>
        </Map>
    );
};

export default ViewNeighborhoodMapBox;
