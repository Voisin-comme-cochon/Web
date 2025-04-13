import * as React from 'react';
import Map from "react-map-gl/mapbox";
import {SearchBox} from "@mapbox/search-js-react";

export default function MapBox() {
    const MAPBOX_TOKEN = import.meta.env.VITE_VCC_MAPBOX_PUBLIC_KEY;
    const [viewState, setViewState] = React.useState({
        longitude: 2.2137,
        latitude: 46.2276,
        zoom: 4
    });

    const handleRetrieve = (res: any) => {
        if (res && res.features && res.features.length > 0) {
            const coords = res.features[0].geometry.coordinates;
            setViewState({
                ...viewState,
                latitude: coords[1],
                longitude: coords[0],
                zoom: 10,
            });
        }
    };

    return (
        <div className="w-[90vw] h-[60vh] rounded-2xl overflow-hidden shadow-lg relative">
            <div style={{position: 'absolute', top: 10, left: 10, zIndex: 1, width: 300}}>
                <SearchBox accessToken={MAPBOX_TOKEN} onRetrieve={handleRetrieve}
                           placeholder="Rechercher une ville..."/>
            </div>
            <Map
                {...viewState}
                mapboxAccessToken={MAPBOX_TOKEN}
                onMove={evt => setViewState(evt.viewState)}
                mapStyle="mapbox://styles/mapbox/streets-v9"
            />;
        </div>
    );
}