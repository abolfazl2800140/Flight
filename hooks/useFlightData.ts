import { useState } from 'react';
import type { Flight } from '../types';

const FLIGHT_COUNT = 20000;

const generateInitialFlights = (count: number): Flight[] => {
  const flights: Flight[] = [];
  const origins = [
    { city: 'New York', code: 'JFK' }, { city: 'London', code: 'LHR' },
    { city: 'Tokyo', code: 'HND' }, { city: 'Dubai', code: 'DXB' },
    { city: 'Los Angeles', code: 'LAX' }, { city: 'Singapore', code: 'SIN' },
    { city: 'Paris', code: 'CDG' }, { city: 'Sydney', code: 'SYD' },
  ];
  const airlines = [
    { name: 'American', code: 'AA' }, { name: 'Emirates', code: 'EK' },
    { name: 'Lufthansa', code: 'LH' }, { name: 'Qantas', code: 'QF' },
    { name: 'Singapore', code: 'SQ' }, { name: 'British', code: 'BA' },
  ];
  const aircraftTypes = ['B777', 'A380', 'B747', 'A350', 'B787'];

  const randomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const randomNumber = () => Math.floor(Math.random() * 10);

  for (let i = 0; i < count; i++) {
    const origin = origins[Math.floor(Math.random() * origins.length)];
    const destination = origins[Math.floor(Math.random() * origins.length)];
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    
    flights.push({
      id: `FL${1000 + i}`,
      callsign: `${airline.code}${100 + i}`,
      flightNumber: `${airline.code}${Math.floor(Math.random() * 900) + 100}`,
      airline: `${airline.name} Airlines`,
      aircraftType: aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)],
      registration: `${randomLetter()}${randomLetter()}-${randomLetter()}${randomLetter()}${randomLetter()}`,
      origin,
      destination,
      lat: Math.random() * 170 - 85, // Latitude from -85 to 85
      lon: Math.random() * 360 - 180, // Longitude from -180 to 180
      altitude: Math.floor(Math.random() * 20000) + 20000, // 20k to 40k feet
      speed: Math.floor(Math.random() * 100) + 450, // 450 to 550 knots
      heading: Math.random() * 360,
    });
  }
  return flights;
};


export const useFlightData = () => {
  const [flights] = useState<Flight[]>(() => generateInitialFlights(FLIGHT_COUNT));

  // The movement simulation logic has been removed.
  // The hook now only provides the initial, static flight data.

  return flights;
};
