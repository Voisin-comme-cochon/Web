import Map, { Layer, Source } from 'react-map-gl/mapbox';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapBoxParameters } from '@/domain/models/MapBoxParameters.ts';
import { useMapBox } from '@/presentation/hooks/useMapBox.ts';
import SearchBoxWrapper from '@/components/MapBox/SearchBoxWrapper.tsx';

export default function MapBox({
    canCreate,
    showDetails,
    onGeoSelect,
    specificNeighborhood,
    centerOnNeighborhood,
}: MapBoxParameters) {
    const { mapRef, viewState, setViewState, featuresFromDB, onMapLoad, handleRetrieve, MAPBOX_TOKEN } = useMapBox({
        canCreate,
        showDetails,
        onGeoSelect,
        specificNeighborhood,
        centerOnNeighborhood,
    });

    return (
        <div className="w-11/12 h-4/6 rounded-2xl overflow-hidden shadow-lg relative">
            {!specificNeighborhood && (
                <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1, width: 300 }}>
                    <SearchBoxWrapper
                        accessToken={MAPBOX_TOKEN}
                        onRetrieve={handleRetrieve}
                        placeholder="Rechercher une adresse..."
                    />
                </div>
            )}

            <Map
                {...viewState}
                mapboxAccessToken={MAPBOX_TOKEN}
                ref={mapRef}
                onMove={(evt) => setViewState(evt.viewState)}
                onLoad={onMapLoad}
                mapStyle="mapbox://styles/mapbox/streets-v9"
                interactiveLayerIds={showDetails || specificNeighborhood ? ['readonly-layer'] : []}
            >
                {featuresFromDB && featuresFromDB.length > 0 && (
                    <Source
                        id="readonly-source"
                        type="geojson"
                        data={{
                            type: 'FeatureCollection',
                            features: featuresFromDB.map((feature) => ({
                                type: 'Feature',
                                geometry: {
                                    type: 'Polygon',
                                    coordinates: feature.coordinates || feature.coordinates,
                                },
                                properties: feature.properties || {
                                    name: 'Quartier',
                                    description: 'Description du quartier',
                                },
                            })),
                        }}
                    >
                        <Layer
                            id="readonly-layer"
                            type="fill"
                            paint={{
                                'fill-color': '#ED5C3B',
                                'fill-opacity': 0.4,
                            }}
                        />
                        <Layer
                            id="readonly-layer-stroke"
                            type="line"
                            paint={{
                                'line-color': '#ED5C3B',
                                'line-width': 2,
                            }}
                        />
                    </Source>
                )}
            </Map>
        </div>
    );
}
