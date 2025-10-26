export interface Flight {
  unique_key: string;
  icao_24bit: string;
  latitude: number;
  longitude: number;
  track: number | null;
  altitude: number;
  ground_speed: number;
  vertical_speed: number;
  squawk: string | null;
  aircraft_code: string;
  registration: string;
  timestamp: number;
  origin_airport_iata: string;
  destination_airport_iata: string;
  airline_iata: string;
  airline_icao: string;
  flight_number: string;
  callsign: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export interface Filters {
  minAltitude: number;
  maxAltitude: number;
  minSpeed: number;
  maxSpeed: number;
  airline: string;
}
