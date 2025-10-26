import React, { useState, useMemo, useCallback } from 'react';
import Map from './components/Map';
import FlightInfoPanel from './components/FlightInfoPanel';
import Header from './components/Header';
import AssistantDrawer from './components/AssistantDrawer';
import FilterDrawer from './components/FilterDrawer';
import LoadingSpinner from './components/LoadingSpinner';
import { useFlightData } from './hooks/useFlightData';
import type { Flight, Filters } from './types';

const INITIAL_FILTERS: Filters = {
  minAltitude: 0,
  maxAltitude: 50000,
  minSpeed: 0,
  maxSpeed: 1000,
  airline: '',
};

function App() {
  const { flights, isLoading, error } = useFlightData();
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  const handleSelectFlight = useCallback((flight: Flight) => {
    setSelectedFlight(flight);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedFlight(null);
  }, []);

  const filteredFlights = useMemo(() => {
    return flights.filter(flight => {
      const airlineFilter = filters.airline.trim().toUpperCase();
      return (
        flight.altitude >= filters.minAltitude &&
        flight.altitude <= filters.maxAltitude &&
        flight.ground_speed >= filters.minSpeed &&
        flight.ground_speed <= filters.maxSpeed &&
        (!airlineFilter || flight.airline_iata.toUpperCase().includes(airlineFilter))
      );
    });
  }, [flights, filters]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-red-400">
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">خطا در بارگذاری داده‌ها</h2>
            <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen w-screen bg-gray-900 text-white relative overflow-hidden">
      <Header 
        onToggleAssistant={() => setIsAssistantOpen(true)}
        onToggleFilters={() => setIsFilterOpen(true)}
        flightCount={filteredFlights.length}
      />
      
      <Map
        flights={filteredFlights}
        onSelectFlight={handleSelectFlight}
        selectedFlightId={selectedFlight?.unique_key || null}
      />
      
      <FlightInfoPanel
        flight={selectedFlight}
        onClose={handleClosePanel}
      />

      <AssistantDrawer 
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onReset={() => setFilters(INITIAL_FILTERS)}
      />
    </main>
  );
}

export default App;
