
import React, { useState, useEffect } from 'react';
import type { Flight } from '../types';
import { getRouteInfo } from '../services/geminiService';
import { CloseIcon } from './icons/CloseIcon';
import { AirplaneIcon } from './icons/AirplaneIcon';
import { InfoIcon } from './icons/InfoIcon';

interface FlightInfoPanelProps {
  flight: Flight | null;
  onClose: () => void;
}

const InfoItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-400">{label}</p>
    <p className="text-lg font-medium truncate">{value}</p>
  </div>
);


const FlightInfoPanel: React.FC<FlightInfoPanelProps> = ({ flight, onClose }) => {
  const [routeInfo, setRouteInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (flight) {
      const fetchRouteInfo = async () => {
        setIsLoading(true);
        setError(null);
        setRouteInfo(null);
        try {
          const info = await getRouteInfo(flight.origin_airport_iata, flight.destination_airport_iata);
          setRouteInfo(info);
        } catch (err) {
          setError('خطا در دریافت اطلاعات مسیر پرواز.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRouteInfo();
    }
  }, [flight]);

  if (!flight) {
    return null;
  }

  return (
    <div
      className={`absolute top-0 left-0 h-full w-full max-w-sm bg-gray-800/80 backdrop-blur-sm shadow-2xl z-30 transform transition-transform duration-300 ease-in-out ${
        flight ? 'translate-x-0' : '-translate-x-full'
      }`}
      role="dialog"
      aria-labelledby="flight-info-heading"
      aria-modal="true"
    >
      <div className="p-6 h-full flex flex-col">
        <header className="flex items-center justify-between pb-4 border-b border-gray-600">
          <div className="flex items-center gap-3">
            <AirplaneIcon className="w-6 h-6 text-cyan-400" />
            <h2 id="flight-info-heading" className="text-xl font-semibold">
              {flight.airline_iata} {flight.callsign}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="بستن پنل اطلاعات پرواز"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="mt-6 flex-grow overflow-y-auto space-y-6">
          
          {/* Route Card */}
          <div className="p-4 rounded-lg bg-gray-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">مبدا</p>
                <p className="text-3xl font-bold">{flight.origin_airport_iata}</p>
              </div>
              <div className="text-center pt-5">
                 <svg className="w-8 h-8 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-6l-2 9-4-18-2 9H2"/>
                 </svg>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-400">مقصد</p>
                <p className="text-3xl font-bold">{flight.destination_airport_iata}</p>
              </div>
            </div>
          </div>

          {/* Live Data Card */}
          <div className="p-4 rounded-lg bg-gray-900/50">
            <h3 className="text-md font-semibold text-gray-200 mb-3">داده‌های زنده</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <InfoItem label="ارتفاع" value={`${flight.altitude.toLocaleString('fa-IR')} فوت`} />
              <InfoItem label="سرعت زمینی" value={`${flight.ground_speed} نات`} />
              <InfoItem label="سرعت عمودی" value={`${flight.vertical_speed} فوت/دقیقه`} />
              <InfoItem label="جهت" value={flight.track ? `${flight.track}°` : 'نامشخص'} />
              <InfoItem label="عرض جغرافیایی" value={flight.latitude.toFixed(4)} />
              <InfoItem label="طول جغرافیایی" value={flight.longitude.toFixed(4)} />
            </div>
          </div>
          
          {/* Aircraft Details Card */}
          <div className="p-4 rounded-lg bg-gray-900/50">
             <h3 className="text-md font-semibold text-gray-200 mb-3">جزئیات هواپیما</h3>
             <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <InfoItem label="هواپیما" value={flight.aircraft_code} />
                <InfoItem label="شماره ثبت" value={flight.registration} />
                <InfoItem label="شرکت هواپیمایی (ICAO)" value={flight.airline_icao} />
                <InfoItem label="کد ۲۴-بیتی ICAO" value={flight.icao_24bit} />
                <InfoItem label="کد اسکوک" value={flight.squawk || 'نامشخص'} />
                <InfoItem label="روی زمین" value={flight.on_ground ? 'بله' : 'خیر'} />
             </div>
          </div>
          
          {/* Technical Details Card */}
          <div className="p-4 rounded-lg bg-gray-900/50">
            <h3 className="text-md font-semibold text-gray-200 mb-3">جزئیات فنی</h3>
            <div className="grid grid-cols-1 gap-y-3">
              <InfoItem label="آخرین بروزرسانی موقعیت" value={new Date(flight.timestamp).toLocaleString('fa-IR')} />
              <InfoItem label="شناسه یکتا" value={flight.unique_key} />
            </div>
          </div>

          {/* Gemini Insights Card */}
          <div className="mt-8 p-4 rounded-lg bg-gray-900/50">
            <div className="flex items-center gap-2 mb-3">
              <InfoIcon className="w-5 h-5 text-cyan-400" />
              <h3 className="text-md font-semibold text-gray-200">اطلاعات مسیر از جمنای</h3>
            </div>
            {isLoading && (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              </div>
            )}
            {error && <p className="text-red-400">{error}</p>}
            {routeInfo && <p className="text-gray-300 text-sm leading-relaxed">{routeInfo}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightInfoPanel;