import { useState } from 'react';
import type { Flight } from '../types';

// Data for randomization
const AIRCRAFT_CODES = ['A320', 'B738', 'A359', 'B77W', 'B789', 'A388', 'E190'];
const AIRLINE_IATAS = ['IR', 'W5', 'EP', 'QF', 'EK', 'LH', 'DL', 'BA', 'AF', 'SQ', 'QR', 'TK'];
const AIRLINE_ICAOS = ['IRA', 'IRM', 'MAW', 'QFA', 'UAE', 'DLH', 'DAL', 'BAW', 'AFR', 'SIA', 'QTR', 'THY'];

// Helper function to generate a single random flight
const createRandomFlight = (uniqueId: number): Flight => {
  // Generate a random position on the globe with uniform distribution
  const u = Math.random();
  const v = Math.random();
  const latitude = Math.acos(2 * v - 1) * (180 / Math.PI) - 90;
  const longitude = 360 * u - 180;

  const airlineIndex = Math.floor(Math.random() * AIRLINE_IATAS.length);
  const callsign = `${AIRLINE_ICAOS[airlineIndex]}${Math.floor(100 + Math.random() * 900)}`;
  const flight_number = `${AIRLINE_IATAS[airlineIndex]}${Math.floor(100 + Math.random() * 900)}`;
  const registration = `E${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

  return {
    unique_key: `id_${uniqueId}`,
    icao_24bit: (Math.floor(Math.random() * 16777215)).toString(16).toUpperCase().padStart(6, '0'),
    latitude,
    longitude,
    track: Math.floor(Math.random() * 360),
    altitude: Math.floor(Math.random() * 450) * 100,
    ground_speed: Math.floor(Math.random() * 400) + 150,
    vertical_speed: Math.floor(Math.random() * 4000) - 2000,
    squawk: Math.floor(Math.random() * 8000).toString().padStart(4, '0'),
    aircraft_code: AIRCRAFT_CODES[Math.floor(Math.random() * AIRCRAFT_CODES.length)],
    registration,
    timestamp: Date.now(),
    origin_airport_iata: "N/A",
    destination_airport_iata: "N/A",
    airline_iata: AIRLINE_IATAS[airlineIndex],
    airline_icao: AIRLINE_ICAOS[airlineIndex],
    flight_number,
    callsign,
  };
};

const generateInitialFlights = (count: number): Flight[] => {
  const flights: Flight[] = [];
  for (let i = 0; i < count; i++) {
    flights.push(createRandomFlight(i));
  }
  return flights;
};


export const useFlightData = () => {
  // Generate 5000 flights once on initial load
  const [flights] = useState<Flight[]>(() => generateInitialFlights(5000));
  
  return {
    flights,
    isLoading: false,
    error: null,
  };
};