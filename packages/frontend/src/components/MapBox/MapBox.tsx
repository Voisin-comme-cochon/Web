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

type Neighborhood = {
    id: number;
    name: string;
    geo: {
        type: string;
        coordinates: number[][][];
    };
    status: string;
    description: string;
    creationDate: string;
};

type GeoJSONFeatureCollection = {
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
};

export default function MapBox({canCreate, showDetails}: Parameters) {
    const MAPBOX_TOKEN = import.meta.env.VITE_VCC_MAPBOX_PUBLIC_KEY;
    const mapRef = React.useRef<MapRef>(null);
    const drawRef = React.useRef<MapboxDraw>();
    const [featuresFromDB, setFeaturesFromDB] = React.useState<GeoJSONFeatureCollection | null>(null);

    const [viewState, setViewState] = React.useState({
        longitude: 2.2137,
        latitude: 46.2276,
        zoom: 4,
    });

    const handleRetrieve = (res: any) => {
        console.log('Résultat de la recherche :', res);
        if (res?.features?.length > 0) {
            const coords = res.features[0].geometry.coordinates;
            setViewState({
                ...viewState,
                latitude: coords[1],
                longitude: coords[0],
                zoom: 12,
            });
        }
    };

    const fetchDataFromDB = async () => {
        const response = await fetch('http://localhost:3000/neighborhoods?status=accepted', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data: Neighborhood[] = await response.json();
        console.log('Données brutes:', data);

        // Transformation en FeatureCollection
        const geoJson: GeoJSONFeatureCollection = {
            type: 'FeatureCollection',
            features: data.map((zone) => ({
                type: 'Feature',
                geometry: zone.geo,
                properties: {
                    id: zone.id,
                    name: zone.name,
                    description: zone.description,
                    color: '#FF5733', // Couleur statique ou à randomiser
                },
            })),
        };

        console.log('GeoJSON transformé :', geoJson);
        setFeaturesFromDB(geoJson);
    };

    const updateDrawData = () => {
        const data = drawRef.current?.getAll();
        console.log('GeoJSON dessiné :', data);
        // TODO : Envoi vers l'API selon create/update/delete
    };

    const onMapLoad = async () => {
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
            await fetchDataFromDB();

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
        <div className="w-11/12 h-4/6 rounded-2xl overflow-hidden shadow-lg relative">
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
