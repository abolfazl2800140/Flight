import React, { useState, useMemo, useCallback } from 'react';
import Map from './components/Map';
import Header from './components/Header';
import FlightInfoPanel from './components/FlightInfoPanel';
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

const MOCK_REPORTS: Report[] = [
    {
        _id: '68f8eadd6835a804b693f85e',
        analysis_id: 'ba40bd81-f781-460f-bf91-73982a5ab1fd',
        data: {
            analysis_period_hours: 24,
            analysis_timestamp: new Date(Date.now() - 86400000).toISOString(),
            final_assessment: { confidence_level: "high", overall_status: "safe" },
            region: {
                area_km2: 6117191.95,
                center: [38.19, -11.29],
                coordinates: { lat1: 35.6762, lat2: 40.7128, lng1: 51.4214, lng2: -74.006 }
            }
        },
        status: "completed",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86300000).toISOString(),
    }
];


function App() {
  const { flights, isLoading, error } = useFlightData();
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  
  const [isAssistantOpen, setAssistantOpen] = useState(false);
  const [isFiltersOpen, setFiltersOpen] = useState(false);
  const [isReportsOpen, setReportsOpen] = useState(false);
  
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);

  const handleSelectFlight = useCallback((flight: Flight) => {
    setSelectedFlight(flight);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedFlight(null);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const handleAddReport = useCallback((reportInput: ReportInput) => {
    const newReport: Report = {
        _id: `id_${Date.now()}`,
        analysis_id: `an_${crypto.randomUUID()}`,
        data: {
            analysis_period_hours: reportInput.hours_back as number,
            analysis_timestamp: new Date().toISOString(),
            final_assessment: { 
                confidence_level: Math.random() > 0.66 ? "high" : Math.random() > 0.33 ? "medium" : "low", 
                overall_status: Math.random() > 0.66 ? "safe" : Math.random() > 0.33 ? "caution" : "unsafe" 
            },
            region: {
                area_km2: Math.floor(Math.random() * 10000000),
                center: [
                    ((reportInput.lat1 as number) + (reportInput.lat2 as number))/2, 
                    ((reportInput.lng1 as number) + (reportInput.lng2 as number))/2
                ],
                coordinates: {
                    lat1: reportInput.lat1 as number,
                    lat2: reportInput.lat2 as number,
                    lng1: reportInput.lng1 as number,
                    lng2: reportInput.lng2 as number,
                }
            }
        },
        status: "completed",
        timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    setReports(prev => [newReport, ...prev]);
  }, []);

  const handleDeleteReport = useCallback((reportId: string) => {
      setReports(prev => prev.filter(r => r._id !== reportId));
  }, []);


  const filteredFlights = useMemo(() => {
    return flights.filter(f => {
      const airlineFilter = filters.airline.trim().toUpperCase();
      const airlineMatch = airlineFilter === '' || f.airline_iata.toUpperCase().includes(airlineFilter) || f.airline_icao.toUpperCase().includes(airlineFilter);

      return (
        f.altitude >= filters.minAltitude &&
        f.altitude <= filters.maxAltitude &&
        f.ground_speed >= filters.minSpeed &&
        f.ground_speed <= filters.maxSpeed &&
        airlineMatch
      );
    });
  }, [flights, filters]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-white bg-gray-900 h-screen flex items-center justify-center">Error loading data.</div>;
  }

  return (
    <div className="bg-gray-800 text-white h-screen overflow-hidden relative font-sans-fa">
      <Header 
        onToggleAssistant={() => setAssistantOpen(prev => !prev)}
        onToggleFilters={() => setFiltersOpen(prev => !prev)}
        onToggleReports={() => setReportsOpen(prev => !prev)}
        flightCount={filteredFlights.length}
      />
      
      <main className="h-full pt-16">
         <Map 
            flights={filteredFlights}
            onSelectFlight={handleSelectFlight}
            selectedFlightId={selectedFlight?.unique_key || null}
         />
      </main>

      <FlightInfoPanel flight={selectedFlight} onClose={handleClosePanel} />
      <AssistantDrawer isOpen={isAssistantOpen} onClose={() => setAssistantOpen(false)} />
      <FilterDrawer 
        isOpen={isFiltersOpen} 
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onReset={resetFilters}
      />
      <ReportsDrawer 
        isOpen={isReportsOpen} 
        onClose={() => setReportsOpen(false)}
        reports={reports}
        onAddReport={handleAddReport}
        onDeleteReport={handleDeleteReport}
      />
    </div>
  );
}

export default App;