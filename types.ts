export interface Flight {
  aircraft_code: string;
  airline_iata: string;
  airline_icao: string;
  altitude: number;
  callsign: string;
  destination_airport_iata: string;
  destination_airport_icao: string | null;
  flight_id: string;
  global_unique_key: string;
  ground_speed: number;
  icao_24bit: string;
  inserted_at: string;
  latitude: number;
  longitude: number;
  on_ground: 0 | 1;
  origin_airport_iata: string;
  origin_airport_icao: string | null;
  registration: string;
  squawk: string;
  timestamp: string;
  track: number | null;
  unique_key: string;
  vertical_speed: number;
  zone: string;
}
