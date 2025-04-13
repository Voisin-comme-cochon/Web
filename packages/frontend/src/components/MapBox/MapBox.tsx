import * as React from 'react';
import Map, {Layer, MapRef, Source} from 'react-map-gl/mapbox';
import {SearchBox} from '@mapbox/search-js-react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';

type Parameters = {
    canCreate: boolean;
    showDetails: boolean;
};

export default function MapBox({canCreate, showDetails}: Parameters) {
    const MAPBOX_TOKEN = import.meta.env.VITE_VCC_MAPBOX_PUBLIC_KEY;
    const mapRef = React.useRef<MapRef>(null); // Gère la référence de la carte
    const drawRef = React.useRef<MapboxDraw>(); // Gère le dessin sur la carte
    const [featuresFromDB, setFeaturesFromDB] = React.useState({ // TODO : Récupérer les données de la BDD
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [2.1446064070470356, 48.947116696079576],
                            [2.0986385249381954, 48.89780312326957],
                            [2.266562012639639, 48.89040188741993],
                            [2.201831729671312, 48.96682849232582],
                            [2.1446064070470356, 48.947116696079576],
                        ],
                    ],
                },
                properties: {
                    id: 1,
                    name: "Zone de test",
                    color: "#0080ff",
                },
            },
        ],
    });

    const [viewState, setViewState] = React.useState({ // Init la vue de base de la carte
        longitude: 2.2137,
        latitude: 46.2276,
        zoom: 4,
    });

    const handleRetrieve = (res: any) => { // TODO : Typer
        console.log('Résultat de la recherche :', res);
        if (res?.features?.length > 0) {
            const coords = res.features[0].geometry.coordinates;
            setViewState({ // Met à jour la vue de la carte avec les coordonnées de la recherche
                ...viewState,
                latitude: coords[1],
                longitude: coords[0],
                zoom: 12,
            });
        }
    };

    const updateDrawData = () => {
        const data = drawRef.current?.getAll();
        // TODO : Envoyer les données à la BDD en fonction de si c'est update, create ou delete
        console.log('GeoJSON dessiné :', data);
    };

    const onMapLoad = () => {
        const map = mapRef.current?.getMap();
        if (!map) return;

        if (canCreate && !drawRef.current) {
            const draw = new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    polygon: true,
                    trash: true,
                },
                defaultMode: 'draw_polygon',
            });

            drawRef.current = draw;
            map.addControl(draw);

            map.on('draw.create', updateDrawData);
            map.on('draw.update', updateDrawData);
            map.on('draw.delete', updateDrawData);
        }

        if (showDetails) {
            map.on('click', 'readonly-layer', (e) => {
                const feature = e.features?.[0];
                if (feature) {
                    const id = feature.properties?.id;
                    console.log('ID cliqué :', id);
                }
            });

            map.on('mouseenter', 'readonly-layer', () => {
                map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', 'readonly-layer', () => {
                map.getCanvas().style.cursor = '';
            });
        }
    };

    return (
        <div className="w-[90vw] h-[60vh] rounded-2xl overflow-hidden shadow-lg relative">
            <div style={{position: 'absolute', top: 10, left: 10, zIndex: 1, width: 300}}>
                <SearchBox
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
                {featuresFromDB && (
                    <Source id="readonly-source" type="geojson" data={featuresFromDB}>
                        <Layer
                            id="readonly-layer"
                            type="fill"
                            paint={{
                                'fill-color': ['get', 'color'],
                                'fill-opacity': 0.4,
                            }}
                        />
                    </Source>
                )}
            </Map>
        </div>
    );
}
