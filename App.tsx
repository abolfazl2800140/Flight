import React, { useState, useMemo, useCallback } from 'react';
import Map from './components/Map';
import FlightInfoPanel from './components/FlightInfoPanel';
import Header from './components/Header';
import AssistantDrawer from './components/AssistantDrawer';
import FilterDrawer from './components/FilterDrawer';
import ReportsDrawer from './components/ReportsDrawer';
import LoadingSpinner from './components/LoadingSpinner';
import { useFlightData } from './hooks/useFlightData';
import type { Flight, Filters, Report, ReportInput } from './types';

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
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [reports, setReports] = useState<Report[]>([]);

  const handleSelectFlight = useCallback((flight: Flight) => {
    setSelectedFlight(flight);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedFlight(null);
  }, []);
  
  const handleAddReport = useCallback((reportInput: ReportInput) => {
      const newReport: Report = {
          _id: `rep_${Date.now()}`,
          analysis_id: `ba40bd81-${Math.random().toString(16).slice(2)}`,
          data: {
              analysis_period_hours: Number(reportInput.hours_back),
              analysis_timestamp: new Date().toISOString(),
              final_assessment: {
                  confidence_level: "medium",
                  overall_status: "safe",
              },
              region: {
                  area_km2: Math.random() * 1000000,
                  center: [
                      (Number(reportInput.lat1) + Number(reportInput.lat2)) / 2,
                      (Number(reportInput.lng1) + Number(reportInput.lng2)) / 2,
                  ],
                  coordinates: {
                      lat1: Number(reportInput.lat1),
                      lat2: Number(reportInput.lat2),
                      lng1: Number(reportInput.lng1),
                      lng2: Number(reportInput.lng2),
                  }
              }
          },
          status: "completed",
          timestamp: new Date().toISOString(),
          updated_at: new Date().toISOString(),
      };
      setReports(prev => [newReport, ...prev]);
  }, []);

  const handleDeleteReport = useCallback((reportId: string) => {
      setReports(prev => prev.filter(r => r._id !== reportId));
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
        onToggleReports={() => setIsReportsOpen(true)}
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

      <ReportsDrawer
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        reports={reports}
        onAddReport={handleAddReport}
        onDeleteReport={handleDeleteReport}
      />
    </main>
  );
}

export default App;