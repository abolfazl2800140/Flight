import { useState, useEffect } from 'react';
import type { Flight } from '../types';

// A working, public API for flight data
const API_URL = 'https://opensky-network.org/api/states/all';

// Mock data for fields not provided by the OpenSky API
const MOCK_AIRPORTS = ['JFK', 'LAX', 'ORD', 'LHR', 'CDG', 'HND', 'DXB', 'AMS', 'FRA', 'IST', 'IKA', 'THR', 'MHD', 'SYZ'];
const MOCK_AIRLINES = [['IR', 'IRA'], ['W5', 'IRM'], ['EP', 'IRC'], ['B9', 'IRB'], ['ZV', 'IZG'], ['QB', 'QSM'], ['VR', 'VRH'], ['AA', 'AAL'], ['DL', 'DAL'], ['UA', 'UAL']];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const useFlightData = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlights = async () => {
      setError(null);
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`خطا در دریافت اطلاعات پرواز: ${response.statusText}`);
        }
        const data = await response.json();

        if (!data || !Array.isArray(data.states)) {
            throw new Error('فرمت داده‌های دریافتی از API نامعتبر است.');
        }

        // Process the first 1000 flights for performance
        const transformedFlights: Flight[] = data.states
          .slice(0, 1000)
          .map((f: any[]) => {
            const icao24bit = f[0] || `unknown-${Math.random()}`;
            const callsign = f[1]?.trim() || 'N/A';
            const longitude = f[5];
            const latitude = f[6];
            const baro_altitude_m = f[7];
            const velocity_ms = f[9];
            const track = f[10];
            const vertical_rate_ms = f[11];
            const geo_altitude_m = f[13];
            const squawk = f[14];
            const last_contact = f[4];

            // Basic filter for flights with position data
            if (latitude === null || longitude === null) {
              return null;
            }

            // Mock additional data
            const origin = getRandomElement(MOCK_AIRPORTS);
            let destination = getRandomElement(MOCK_AIRPORTS);
            while (destination === origin) {
              destination = getRandomElement(MOCK_AIRPORTS);
            }
            const [airlineIata, airlineIcao] = getRandomElement(MOCK_AIRLINES);

            return {
              unique_key: icao24bit,
              icao_24bit: icao24bit,
              callsign: callsign,
              longitude: longitude,
              latitude: latitude,
              altitude: Math.round((geo_altitude_m || baro_altitude_m || 0) * 3.28084), // meters to feet
              track: track || null,
              ground_speed: Math.round((velocity_ms || 0) * 1.94384), // m/s to knots
              vertical_speed: Math.round((vertical_rate_ms || 0) * 196.85), // m/s to feet/min
              squawk: squawk || null,
              timestamp: (last_contact || Date.now() / 1000) * 1000,
              // Mocked properties
              aircraft_code: 'A320', // Mock
              registration: `N${Math.floor(100 + Math.random() * 900)}`, // Mock
              origin_airport_iata: origin, // Mock
              destination_airport_iata: destination, // Mock
              airline_iata: callsign.substring(0, 2).toUpperCase() || airlineIata,
              airline_icao: callsign.substring(0, 3).toUpperCase() || airlineIcao,
              flight_number: callsign.substring(3) || `${Math.floor(100 + Math.random() * 900)}`,
            };
        })
        .filter((f): f is Flight => f !== null && f.altitude > 1000 && f.callsign !== 'N/A');
        
        setFlights(transformedFlights);
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('یک خطای ناشناخته رخ داده است.');
        }
        console.error("Failed to fetch flight data:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlights();
  }, []);

  return { flights, isLoading, error };
};