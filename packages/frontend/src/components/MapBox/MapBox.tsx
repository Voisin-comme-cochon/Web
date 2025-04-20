import Map, {Layer, Source} from 'react-map-gl/mapbox';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import {MapBoxParameters} from "@/domain/models/MapBoxParameters.ts";
import {useMapBox} from "@/presentation/hooks/useMapBox.ts";
import SearchBoxWrapper from "@/components/MapBox/SearchBoxWrapper.tsx";

export default function MapBox({canCreate, showDetails}: MapBoxParameters) {
    const {
        mapRef,
        viewState,
        setViewState,
        featuresFromDB,
        onMapLoad,
        handleRetrieve,
        MAPBOX_TOKEN,
    } = useMapBox({canCreate, showDetails});

    return (
        <div className="w-11/12 h-4/6 rounded-2xl overflow-hidden shadow-lg relative">
            <div style={{position: 'absolute', top: 10, left: 10, zIndex: 1, width: 300}}>
                <SearchBoxWrapper
                    accessToken={MAPBOX_TOKEN}
                    onRetrieve={handleRetrieve}
                    placeholder="Rechercher une adresse..."
                />
            </div>

            <Map
                {...viewState}
                mapboxAccessToken={MAPBOX_TOKEN}
                ref={mapRef}
                onMove={(evt) => setViewState(evt.viewState)}
                onLoad={onMapLoad}
                mapStyle="mapbox://styles/mapbox/streets-v9"
                interactiveLayerIds={showDetails ? ['readonly-layer'] : []}
            >
                {featuresFromDB && featuresFromDB.length > 0 && (
                    <Source
                        id="readonly-source"
                        type="geojson"
                        data={{
                            type: 'FeatureCollection',
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            features: featuresFromDB,
                        }}
                    >
                        <Layer
                            id="readonly-layer"
                            type="fill"
                            paint={{
                                'fill-color': "#ED5C3B",
                                'fill-opacity': 0.4,
                            }}
                        />
                    </Source>
                )}
            </Map>
        </div>
    );
}
