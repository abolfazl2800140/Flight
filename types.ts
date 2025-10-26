import React from 'react';

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

export interface ReportInput {
    lat1: number | string;
    lng1: number | string;
    lat2: number | string;
    lng2: number | string;
    hours_back: number | string;
}

export interface Report {
    _id: string;
    analysis_id: string;
    data: {
        analysis_period_hours: number;
        analysis_timestamp: string;
        final_assessment: {
            confidence_level: "low" | "medium" | "high";
            overall_status: "safe" | "caution" | "unsafe";
        };
        region: {
            area_km2: number;
            center: [number, number];
            coordinates: {
                lat1: number;
                lat2: number;
                lng1: number;
                lng2: number;
            };
        };
    };
    status: "completed" | "processing" | "failed";
    timestamp: string;
    updated_at: string;
}