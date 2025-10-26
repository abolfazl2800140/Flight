import { useState } from 'react';
import type { Flight } from '../types';

const FLIGHT_COUNT = 20000;

const generateInitialFlights = (count: number): Flight[] => {
  const flights: Flight[] = [];
  
  const aircraftCodes = ['A21N', 'A320', 'B738', 'B77W', 'A359', 'B789', 'A388'];
  const airlines = [
    { iata: 'TP', icao: 'TAP' }, { iata: 'BA', icao: 'BAW' },
    { iata: 'AF', icao: 'AFR' }, { iata: 'DL', icao: 'DAL' },
    { iata: 'EK', icao: 'UAE' }, { iata: 'LH', icao: 'DLH' },
    { iata: 'QF', icao: 'QFA' }, { iata: 'SQ', icao: 'SIA' },
  ];
  const airports = ['YUL', 'LIS', 'LHR', 'CDG', 'JFK', 'DXB', 'LAX', 'HND', 'SYD', 'SIN'];

  const randomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const randomNumber = () => Math.floor(Math.random() * 10);
  const randomHex = (len: number) => [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();

  for (let i = 0; i < count; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const origin = airports[Math.floor(Math.random() * airports.length)];
    let destination = airports[Math.floor(Math.random() * airports.length)];
    while (destination === origin) {
        destination = airports[Math.floor(Math.random() * airports.length)];
    }
    const now = new Date();

    const uniqueId = `id_${randomHex(8)}`;

    flights.push({
      aircraft_code: aircraftCodes[Math.floor(Math.random() * aircraftCodes.length)],
      airline_iata: airline.iata,
      airline_icao: airline.icao,
      altitude: Math.floor(Math.random() * 15000) + 25000,
      callsign: `${airline.icao}${Math.floor(Math.random() * 900) + 100}`,
      destination_airport_iata: destination,
      destination_airport_icao: null,
      flight_id: "",
      global_unique_key: uniqueId,
      ground_speed: Math.floor(Math.random() * 100) + 400,
      icao_24bit: randomHex(6),
      inserted_at: now.toUTCString(),
      latitude: Math.random() * 170 - 85,
      longitude: Math.random() * 360 - 180,
      on_ground: 0,
      origin_airport_iata: origin,
      origin_airport_icao: null,
      registration: `${randomLetter()}${randomLetter()}-${randomLetter()}${randomLetter()}${randomLetter()}`,
      squawk: "",
      timestamp: now.toUTCString(),
      track: Math.random() * 360,
      unique_key: uniqueId,
      vertical_speed: 0,
      zone: "europe_sub3_3"
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
