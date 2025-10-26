import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import type { Flight } from '../types';
import { FlightCanvasLayer } from './FlightCanvasLayer';

interface MapProps {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
  selectedFlightId: string | null;
}

const Map: React.FC<MapProps> = ({ flights, onSelectFlight, selectedFlightId }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full z-10" aria-label="نقشه پروازها">
        <MapContainer 
            center={[25, 10]} 
            zoom={2.5} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            minZoom={2}
            maxBounds={[[-90, -180], [90, 180]]}
            worldCopyJump={false}
        >
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <FlightCanvasLayer 
            flights={flights} 
            onSelectFlight={onSelectFlight} 
            selectedFlightId={selectedFlightId} 
        />
        </MapContainer>
    </div>
  );
};

export default Map;