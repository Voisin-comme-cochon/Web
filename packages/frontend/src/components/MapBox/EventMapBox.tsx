import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface EventMapBoxProps {
    start: [number, number] | null;
    end?: [number, number] | null;
}

const EventMapBox: React.FC<EventMapBoxProps> = ({ start, end }) => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        // 1) On vérifie que start existe et que ce sont bien deux nombres valides
        if (
            !mapContainer.current ||
            !start ||
            typeof start[0] !== 'number' ||
            typeof start[1] !== 'number' ||
            isNaN(start[0]) ||
            isNaN(start[1])
        ) {
            console.error('Coordonnées "start" invalides :', start);
            return;
        }

        // 2) Récupère le token depuis la variable d’environnement
        const token = import.meta.env.VITE_VCC_MAPBOX_PUBLIC_KEY as string;
        if (!token) {
            console.error('Le token Mapbox n’est pas défini dans VITE_VCC_MAPBOX_PUBLIC_KEY');
            return;
        }
        mapboxgl.accessToken = token;

        // 3) Initialisation basique de la carte
        mapInstance.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: start,
            zoom: 12,
        });
        const map = mapInstance.current!;

        // 4) Ajout du marqueur "start"
        new mapboxgl.Marker({ color: '#3b82f6' }).setLngLat(start).addTo(map);

        // 5) Si on a aussi end, on veut appeler l’API Directions et tracer la vraie route
        if (end && typeof end[0] === 'number' && typeof end[1] === 'number' && !isNaN(end[0]) && !isNaN(end[1])) {
            // 5a) On ajuste le viewport pour englober start et end
            const bounds = new mapboxgl.LngLatBounds();
            bounds.extend(start);
            bounds.extend(end);
            map.fitBounds(bounds, { padding: 40 });

            // 5b) Marqueur "end"
            new mapboxgl.Marker({ color: '#ef4444' }).setLngLat(end).addTo(map);

            // 5c) Au chargement de la carte, on appelle l’API Directions
            map.on('load', () => {
                // 5c-i) Formattage des coordonnées pour l’URL
                const startLngLat = `${start[0]},${start[1]}`;
                const endLngLat = `${end[0]},${end[1]}`;

                const directionsUrl =
                    `https://api.mapbox.com/directions/v5/mapbox/driving/${startLngLat};${endLngLat}` +
                    `?geometries=geojson&overview=full&access_token=${token}`;

                fetch(directionsUrl)
                    .then((res) => {
                        if (!res.ok) {
                            throw new Error(`Directions API erreur : ${res.status}`);
                        }
                        return res.json();
                    })
                    .then((data) => {
                        // 5c-ii) On récupère le premier itinéraire
                        if (
                            data.routes &&
                            Array.isArray(data.routes) &&
                            data.routes.length > 0 &&
                            data.routes[0].geometry
                        ) {
                            const routeGeoJSON = {
                                type: 'Feature',
                                properties: {},
                                geometry: data.routes[0].geometry as GeoJSON.LineString,
                            };

                            // 5c-iii) On ajoute la source + layer (ou on met à jour si déjà présent)
                            if (map.getSource('route')) {
                                (map.getSource('route') as mapboxgl.GeoJSONSource).setData(routeGeoJSON);
                            } else {
                                map.addSource('route', {
                                    type: 'geojson',
                                    data: routeGeoJSON,
                                });
                                map.addLayer({
                                    id: 'route-line',
                                    type: 'line',
                                    source: 'route',
                                    layout: {
                                        'line-join': 'round',
                                        'line-cap': 'round',
                                    },
                                    paint: {
                                        'line-color': '#10b981',
                                        'line-width': 4,
                                    },
                                });
                            }
                        } else {
                            console.error('Aucun itinéraire trouvé dans la réponse Directions.');
                        }
                    })
                    .catch((err) => {
                        console.error('Erreur lors du fetch Directions :', err);
                    });
            });
        } else {
            // 6) Si pas d’end valide, on centre et zoom sur start uniquement
            map.setCenter(start);
            map.setZoom(14);
        }

        return () => {
            if (mapInstance.current) mapInstance.current.remove();
        };
    }, [start, end]);

    return <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />;
};

export default EventMapBox;
