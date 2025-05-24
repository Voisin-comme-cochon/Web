import React, { useState } from "react";
import Map, { Layer, Source, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { NeighborhoodModel } from "@/domain/models/neighborhood.model";
import { useFetchAcceptedNeighborhoodDataWithTab } from "@/presentation/hooks/fetch-neighborhood-data";

type SimpleMapboxShapeProps = {
    mapboxToken: string;
    neighborhood: NeighborhoodModel;
};

const userLayerStyle = {
    id: "user-polygon",
    type: "fill",
    paint: {
        "fill-color": "#ED5C3B",
        "fill-opacity": 0.4,
    },
};

const dbLayerStyle = {
    id: "db-polygons",
    type: "fill",
    paint: {
        "fill-color": "#333333",
        "fill-opacity": 0.3,
    },
};

export const SimpleMapboxShape: React.FC<SimpleMapboxShapeProps> = ({
    mapboxToken,
    neighborhood,
}) => {
    const center = neighborhood.geo.coordinates[0][0];

    const [neighborhoods, setNeighborhoods] = useState<NeighborhoodModel[]>([]);
    const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
    const [popupCoordinates, setPopupCoordinates] = useState<[number, number] | null>(null);

    useFetchAcceptedNeighborhoodDataWithTab(setNeighborhoods);

    const userGeojson = {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: neighborhood.geo.coordinates,
        },
        properties: {
            name: neighborhood.name,
            status: neighborhood.status,
            description: neighborhood.description,
            creationDate: new Date(neighborhood.creationDate).toISOString(),
        },
    };

    const dbFeatures = neighborhoods.map((neighborhood: NeighborhoodModel) => ({
        type: "Feature",
        geometry: neighborhood.geo,
        properties: {
            name: neighborhood.name,
            status: neighborhood.status,
            description: neighborhood.description,
            creationDate: neighborhood.creationDate,
        },
    }));

    const getPolygonCenter = (coordinates: number[][][]) => {
        const flatCoords = coordinates[0];
        const lngSum = flatCoords.reduce((sum, coord) => sum + coord[0], 0);
        const latSum = flatCoords.reduce((sum, coord) => sum + coord[1], 0);
        return [lngSum / flatCoords.length, latSum / flatCoords.length];
    };

    const handleMapClick = (event: any) => {
        const features = event.features;
        if (features && features.length > 0) {
            const clicked = features[0];
            const layerId = clicked.layer.id;
            if (layerId === "db-polygons" || layerId === "user-polygon") {
                const feature = clicked;
                const center = getPolygonCenter(feature.geometry.coordinates);

                setSelectedFeature(feature.properties);
                setPopupCoordinates(center);
            }
        }
    };

    const handleClosePopup = () => {
        setSelectedFeature(null);
        setPopupCoordinates(null);
    };

    return (
        <div style={{ height: 500 }}>
            <Map
                mapboxAccessToken={mapboxToken}
                mapStyle="mapbox://styles/mapbox/streets-v9"
                style={{ width: "100%", height: "100%" }}
                initialViewState={{
                    longitude: center[0],
                    latitude: center[1],
                    zoom: 15,
                }}
                interactiveLayerIds={["db-polygons", "user-polygon"]}
                onClick={handleMapClick}
            >
                {/* Quartiers de la DB */}
                <Source id="db-shapes" type="geojson" data={{
                    type: "FeatureCollection",
                    features: dbFeatures,
                }}>
                    <Layer {...dbLayerStyle} />
                </Source>

                {/* Quartier utilisateur */}
                <Source id="user-shape" type="geojson" data={userGeojson}>
                    <Layer {...userLayerStyle} />
                </Source>

                {/* Popup infos */}
                {selectedFeature && popupCoordinates && (
                    <Popup
                        longitude={popupCoordinates[0]}
                        latitude={popupCoordinates[1]}
                        onClose={handleClosePopup}
                        closeOnClick={false}
                        anchor="top"
                    >
                        <div style={{ maxWidth: "250px" }}>
                            <h4>{selectedFeature.name}</h4>
                            <p><strong>Status:</strong> {selectedFeature.status}</p>
                            <p><strong>Description:</strong> {selectedFeature.description}</p>
                            <p><strong>Created on:</strong> {new Date(selectedFeature.creationDate).toLocaleDateString()}</p>
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    );
};
