import { useRef, useState } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { MapRef } from 'react-map-gl/mapbox';
import { MapBoxGeoJson } from '@/domain/models/MapBoxGeoJson';
import { GetAcceptedNeighborhoods } from '@/domain/use-cases/getAcceptedNeighborhoods';
import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository';
import { ApiService } from '@/infrastructure/api/ApiService';
import { setupDrawEvents } from '@/presentation/state/drawManager.ts';
import { MapBoxParameters } from '@/domain/models/MapBoxParameters.ts';
import * as mapboxgl from 'mapbox-gl';

export const useMapBox = ({ canCreate, showDetails, onGeoSelect }: MapBoxParameters) => {
    const mapRef = useRef<MapRef>(null);
    const drawRef = useRef<MapboxDraw>();
    const [featuresFromDB, setFeaturesFromDB] = useState<MapBoxGeoJson[]>([]);
    const [viewState, setViewState] = useState({
        longitude: 2.2137,
        latitude: 46.2276,
        zoom: 4,
    });

    const MAPBOX_TOKEN = import.meta.env.VITE_VCC_MAPBOX_PUBLIC_KEY;

    const getAcceptedNeighborhoodsUc = new GetAcceptedNeighborhoods(new NeighborhoodFrontRepository(new ApiService()));

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const handleRetrieve = (res) => {
        if (res?.features?.length > 0) {
            const coords = res.features[0].geometry.coordinates;
            setViewState((prev) => ({
                ...prev,
                latitude: coords[1],
                longitude: coords[0],
                zoom: 12,
            }));
        }
    };

    const onMapLoad = async () => {
        const map = mapRef.current?.getMap();
        if (!map) return;

        if (canCreate && !drawRef.current) {
            drawRef.current = setupDrawEvents(map, onGeoSelect);
        }

        if (showDetails) {
            const neighborhoods = await getAcceptedNeighborhoodsUc.execute();
            setFeaturesFromDB(neighborhoods);

            map.on('click', 'readonly-layer', (e) => {
                const feature = e.features?.[0];
                if (feature) {
                    const name = feature.properties?.name || 'Nom inconnu';
                    const description = feature.properties?.description || 'Pas de description';

                    new mapboxgl.Popup({ closeButton: false, closeOnClick: true })
                        .setLngLat(e.lngLat)
                        .setHTML(
                            `
                            <div class="min-w-3xs max-w-[300px] max-h-[200px] overflow-y-auto rounded-lg bg-white shadow-lg p-4 text-sm">
                                <h3 class="text-base font-semibold mb-2 text-gray-800">${name}</h3>
                                <p class="text-gray-700 leading-snug">
                                    ${description}
                                </p>
                            </div>
                        `
                        )
                        .addTo(map);
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

    return {
        mapRef,
        viewState,
        setViewState,
        featuresFromDB,
        onMapLoad,
        handleRetrieve,
        MAPBOX_TOKEN,
    };
};
