export interface Flight {
  id: string;
  callsign: string;
  flightNumber: string;
  airline: string;
  aircraftType: string;
  registration: string;
  origin: {
    city: string;
    code: string;
  };
  destination: {
    city: string;
    code: string;
  };
  lat: number;
  lon: number;
  altitude: number; // in feet
  speed: number; // in knots
  heading: number; // in degrees
}
