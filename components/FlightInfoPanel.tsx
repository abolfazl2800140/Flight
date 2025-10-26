import React, { useState, useEffect } from 'react';
import type { Flight } from '../types';
import { getRouteInfo } from '../services/geminiService';
import { CloseIcon } from './icons/CloseIcon';
import { InfoIcon } from './icons/InfoIcon';

interface FlightInfoPanelProps {
  flight: Flight | null;
  onClose: () => void;
}

interface DetailItemProps {
    label: string;
    value: string | number;
    unit?: string;
    className?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, unit, className = '' }) => (
    <div className={`flex justify-between items-baseline ${className}`}>
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-lg font-semibold text-white truncate">
            {value} <span className="text-sm font-normal text-gray-300">{unit}</span>
        </span>
    </div>
);

const Section: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-cyan-400 mb-3 border-b border-gray-700 pb-2">{title}</h3>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);


const FlightInfoPanel: React.FC<FlightInfoPanelProps> = ({ flight, onClose }) => {
  const [geminiInfo, setGeminiInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Reset Gemini info when flight changes
    setGeminiInfo('');
    setError('');
  }, [flight]);

  const handleGetRouteInfo = async () => {
    if (!flight) return;
    setIsLoading(true);
    setError('');
    setGeminiInfo('');
    try {
      const info = await getRouteInfo(flight.origin_airport_iata, flight.destination_airport_iata);
      setGeminiInfo(info);
    } catch (e) {
      setError('Could not retrieve flight route information. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!flight) {
    return null;
  }

  return (
    <div className={`absolute top-0 right-0 h-full w-full md:w-96 bg-gray-900/80 backdrop-blur-md shadow-2xl z-30 transition-transform duration-500 ease-in-out ${flight ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-cyan-400">{flight.callsign}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
            <Section title="Route">
                <div className="flex items-center justify-between">
                    <div className="text-left">
                        <p className="text-2xl font-bold">{flight.origin_airport_iata}</p>
                    </div>
                    <div className="text-2xl text-gray-500 px-2">&rarr;</div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">{flight.destination_airport_iata}</p>
                    </div>
                </div>
            </Section>
            
            <Section title="Flight Details">
                <DetailItem label="Airline" value={flight.airline_iata} />
                <DetailItem label="Aircraft" value={flight.aircraft_code} />
                <DetailItem label="Registration" value={flight.registration} />
            </Section>

            <Section title="Live Data">
                <DetailItem label="Altitude" value={flight.altitude.toLocaleString()} unit="ft" />
                <DetailItem label="Ground Speed" value={flight.ground_speed} unit="kts" />
                <DetailItem label="Heading" value={(flight.track ?? 0).toFixed(0)} unit="°" />
                <DetailItem label="Latitude" value={flight.latitude.toFixed(4)} unit="°" />
                <DetailItem label="Longitude" value={flight.longitude.toFixed(4)} unit="°" />
            </Section>

            <div className="mt-6">
                <button 
                    onClick={handleGetRouteInfo}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                    <InfoIcon className="w-5 h-5" />
                    {isLoading ? 'Analyzing Route...' : 'Tell Me About This Route'}
                </button>

                {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
                
                {geminiInfo && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <h4 className="font-semibold text-cyan-400 mb-2">Route Insights by Gemini</h4>
                        <p className="text-sm text-gray-300 leading-relaxed">{geminiInfo}</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FlightInfoPanel;
