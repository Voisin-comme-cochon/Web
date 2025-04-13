import * as React from 'react';
import Map from "react-map-gl/mapbox";

export default function MapBox() {
    const [viewState, setViewState] = React.useState({
        longitude: 2.2137,
        latitude: 46.2276,
        zoom: 4
    });
    return (
        <div className="w-[90vw] h-[60vh] rounded-2xl overflow-hidden shadow-lg">
            <Map
                {...viewState}
                mapboxAccessToken={import.meta.env.VITE_VCC_MAPBOX_PUBLIC_KEY}
                onMove={evt => setViewState(evt.viewState)}
                mapStyle="mapbox://styles/mapbox/streets-v9"
            />;
        </div>
    );
}