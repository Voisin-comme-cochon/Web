import React from "react";
import Map, {Layer, Source} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

type SimpleMapboxShapeProps = {
    mapboxToken: string;
    coordinates: number[][][];
};

const layerStyle = {
    id: "polygon",
    type: "fill",
    paint: {
        "fill-color": "#ED5C3B",
        "fill-opacity": 0.4,
    },
};

export const SimpleMapboxShape: React.FC<SimpleMapboxShapeProps> = ({
    mapboxToken,
    coordinates,
}) => {
    const center = coordinates[0][0];

    const geojson = {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: coordinates,
        },
    };

    return (
        <div style={{height: 400}}>
            <Map
                mapboxAccessToken={mapboxToken}
                mapStyle="mapbox://styles/mapbox/streets-v9"
                style={{width: "100%", height: "100%"}}
                initialViewState={{
                    longitude: center[0],
                    latitude: center[1],
                    zoom: 15,
                }}
            >
                <Source id="shape" type="geojson" data={geojson}>
                    <Layer {...layerStyle} />
                </Source>
            </Map>
        </div>
    );
};
