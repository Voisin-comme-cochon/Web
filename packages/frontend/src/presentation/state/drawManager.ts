import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as mapboxgl from "mapbox-gl";

export function setupDrawEvents(map: mapboxgl.Map) {
    const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
            polygon: true,
            trash: true,
        },
        defaultMode: 'draw_polygon',
    });

    map.addControl(draw);

    const updateDrawData = () => {
        const data = draw.getAll();
        // TODO : Envoi vers l'API
    };

    map.on('draw.create', updateDrawData);
    map.on('draw.update', updateDrawData);
    map.on('draw.delete', updateDrawData);

    return draw;
}
