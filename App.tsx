
import React, { useState, useCallback } from 'react';
import { useFlightData } from './hooks/useFlightData';
import type { Flight } from './types';
import Map from './components/Map';
import FlightInfoPanel from './components/FlightInfoPanel';

const App: React.FC = () => {
  const flights = useFlightData();
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  const handleSelectFlight = useCallback((flight: Flight) => {
    setSelectedFlight(flight);
  }, []);

  const handleDeselectFlight = useCallback(() => {
    setSelectedFlight(null);
  }, []);

  return (
    <div className="w-screen h-screen bg-gray-900 text-white overflow-hidden relative">
      <header className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <h1 className="text-2xl font-bold text-white tracking-wider">
          Gemini Flight Tracker
        </h1>
      </header>
      
      <Map 
        flights={flights} 
        onSelectFlight={handleSelectFlight} 
        selectedFlightId={selectedFlight?.id} 
      />
      
      <FlightInfoPanel 
        flight={selectedFlight} 
        onClose={handleDeselectFlight} 
      />
    </div>
  );
};

export default App;
