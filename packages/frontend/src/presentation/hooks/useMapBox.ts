import {useRef, useState} from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import {MapRef} from 'react-map-gl/mapbox';
import {MapBoxGeoJson} from '@/domain/models/MapBoxGeoJson';
import {GetAcceptedNeighborhoods} from '@/domain/use-cases/getAcceptedNeighborhoods';
import {NeighborhoodFrontRepository} from '@/infrastructure/repositories/NeighborhoodFrontRepository';
import {ApiService} from '@/infrastructure/api/ApiService';
import {setupDrawEvents} from "@/presentation/state/drawManager.ts";
import {MapBoxParameters} from "@/domain/models/MapBoxParameters.ts";
import {ResponseResearchMapBox} from "@/domain/models/ResponseResearchMapBox.ts";

export const useMapBox = ({canCreate, showDetails}: MapBoxParameters) => {
    const mapRef = useRef<MapRef>(null);
    const drawRef = useRef<MapboxDraw>();
    const [featuresFromDB, setFeaturesFromDB] = useState<MapBoxGeoJson[]>([]);
    const [viewState, setViewState] = useState({
        longitude: 2.2137,
        latitude: 46.2276,
        zoom: 4,
    });

    const MAPBOX_TOKEN = import.meta.env.VITE_VCC_MAPBOX_PUBLIC_KEY;

    const getAcceptedNeighborhoodsUc = new GetAcceptedNeighborhoods(
        new NeighborhoodFrontRepository(new ApiService())
    );

    const handleRetrieve = (res: ResponseResearchMapBox) => {
        console.log('Résultat de la recherche :', res);
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
            drawRef.current = setupDrawEvents(map);
        }

        if (showDetails) {
            const neighborhoods = await getAcceptedNeighborhoodsUc.execute();
            setFeaturesFromDB(neighborhoods);

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
