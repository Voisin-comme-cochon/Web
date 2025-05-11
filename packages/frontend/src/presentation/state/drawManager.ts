import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as mapboxgl from 'mapbox-gl';
import { Feature, Polygon } from 'geojson';

export function setupDrawEvents(
    map: mapboxgl.Map,
    onGeoSelect?: (geo: { type: string; coordinates: number[][][] }) => void
) {
    const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
            polygon: true,
            trash: true,
        },
        defaultMode: 'draw_polygon',
    });

    map.addControl(draw as any);

    const updateDrawData = () => {
        const data = draw.getAll();
        if (data.features.length > 0 && onGeoSelect) {
            const feature = data.features[0] as Feature<Polygon>;
            onGeoSelect({
                type: feature.geometry.type,
                coordinates: feature.geometry.coordinates,
            });
        }
    };

    map.on('draw.create', updateDrawData);
    map.on('draw.update', updateDrawData);
    map.on('draw.delete', updateDrawData);

    return draw;
}
