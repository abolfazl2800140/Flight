import React, { useState, useCallback } from 'react';
import { useFlightData } from './hooks/useFlightData';
import type { Flight } from './types';
import Map from './components/Map';
import FlightInfoPanel from './components/FlightInfoPanel';
import Header from './components/Header';

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
    <div className="w-screen h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      <Header />
      <main className="flex-grow relative">
        <Map 
          flights={flights} 
          onSelectFlight={handleSelectFlight} 
          selectedFlightId={selectedFlight?.unique_key} 
        />
        
        <FlightInfoPanel 
          flight={selectedFlight} 
          onClose={handleDeselectFlight} 
        />
      </main>
    </div>
  );
};

export default App;