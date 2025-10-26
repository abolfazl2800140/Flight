import React, { useState, useEffect, useCallback } from 'react';
import type { Flight } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { InfoIcon } from './icons/InfoIcon';
import { getRouteInfo } from '../services/geminiService';

interface FlightInfoPanelProps {
  flight: Flight | null;
  onClose: () => void;
}

// Simple in-memory cache
const routeInfoCache = new Map<string, string>();

const FlightInfoPanel: React.FC<FlightInfoPanelProps> = ({ flight, onClose }) => {
  const [routeInfo, setRouteInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setRouteInfo(null);
    setIsLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    resetState();
  }, [flight, resetState]);
  
  const fetchRouteInfo = async () => {
    if (!flight) return;

    const cacheKey = `${flight.origin_airport_iata}-${flight.destination_airport_iata}`;
    if (routeInfoCache.has(cacheKey)) {
        setRouteInfo(routeInfoCache.get(cacheKey)!);
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
        const info = await getRouteInfo(flight.origin_airport_iata, flight.destination_airport_iata);
        routeInfoCache.set(cacheKey, info);
        setRouteInfo(info);
    } catch (e) {
        console.error("Error fetching route info from Gemini:", e);
        setError("خطا در ارتباط با دستیار جمنای. ممکن است به دلیل محدودیت استفاده باشد.");
    } finally {
        setIsLoading(false);
    }
  };


  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-full max-w-sm bg-gray-900/80 backdrop-blur-sm shadow-2xl z-40 transition-transform duration-300 ease-in-out ${
        flight ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {flight && (
        <div className="flex flex-col h-full text-white p-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-700">
            <h2 className="text-xl font-bold truncate">جزئیات پرواز {flight.callsign}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-grow py-4 space-y-4 overflow-y-auto">
            {/* Route */}
            <div className="bg-gray-800 p-3 rounded-lg">
              <h3 className="font-bold text-lg mb-2">مسیر</h3>
              <div className="flex justify-between items-center font-mono text-xl">
                <span>{flight.origin_airport_iata}</span>
                <span className="text-gray-400 text-sm">به سمت</span>
                <span>{flight.destination_airport_iata}</span>
              </div>
               <div className="mt-3">
                 <button 
                   onClick={fetchRouteInfo}
                   disabled={isLoading}
                   className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                 >
                   {isLoading ? 'در حال دریافت...' : 'دریافت اطلاعات مسیر با جمنای'}
                   <InfoIcon className="w-5 h-5"/>
                 </button>
                 {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                 {routeInfo && <p className="text-gray-300 text-sm mt-3 bg-gray-700 p-2 rounded">{routeInfo}</p>}
               </div>
            </div>

            {/* Live Data */}
            <div className="bg-gray-800 p-3 rounded-lg">
                <h3 className="font-bold text-lg mb-2">داده‌های زنده</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                        <p className="text-gray-400">ارتفاع</p>
                        <p className="font-mono text-cyan-300">{flight.altitude.toLocaleString('fa-IR')} فوت</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400">سرعت زمینی</p>
                        <p className="font-mono text-cyan-300">{flight.ground_speed.toLocaleString('fa-IR')} نات</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400">سرعت عمودی</p>
                        <p className="font-mono text-cyan-300">{flight.vertical_speed.toLocaleString('fa-IR')} فوت/دقیقه</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400">جهت حرکت</p>
                        <p className="font-mono text-cyan-300">{flight.track ?? 'N/A'} درجه</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                        <p className="text-gray-400">موقعیت جغرافیایی</p>
                        <p className="font-mono text-cyan-300 text-xs">{flight.latitude.toFixed(4)}, {flight.longitude.toFixed(4)}</p>
                    </div>
                </div>
            </div>
            
            {/* Aircraft Details */}
            <div className="bg-gray-800 p-3 rounded-lg">
                <h3 className="font-bold text-lg mb-2">جزئیات هواپیما</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-gray-400">نوع هواپیما</p>
                        <p className="font-mono">{flight.aircraft_code}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">شماره ثبت</p>
                        <p className="font-mono">{flight.registration}</p>
                    </div>
                     <div>
                        <p className="text-gray-400">شرکت هواپیمایی</p>
                        <p className="font-mono">{flight.airline_iata} / {flight.airline_icao}</p>
                    </div>
                     <div>
                        <p className="text-gray-400">شماره پرواز</p>
                        <p className="font-mono">{flight.flight_number}</p>
                    </div>
                </div>
            </div>

             {/* Technical Details */}
             <div className="bg-gray-800 p-3 rounded-lg">
                <h3 className="font-bold text-lg mb-2">جزئیات فنی</h3>
                 <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-gray-400">کد ICAO 24-bit</p>
                        <p className="font-mono">{flight.icao_24bit}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">کد Squawk</p>
                        <p className="font-mono">{flight.squawk || 'N/A'}</p>
                    </div>
                     <div className="col-span-2">
                        <p className="text-gray-400">آخرین بروزرسانی</p>
                        <p className="font-mono text-xs">{formatTimestamp(flight.timestamp)}</p>
                    </div>
                 </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightInfoPanel;