// FIX: Import `useCallback` from React to resolve reference error.
import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Flight } from '../types';

interface FlightCanvasLayerProps {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
  selectedFlightId: string | null;
}

// Create the airplane Path2D object once for performance
const airplanePath = new Path2D("M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13L21 16Z");

const drawAirplane = (ctx: CanvasRenderingContext2D, x: number, y: number, rotation: number, isSelected: boolean) => {
    const size = isSelected ? 26 : 22;
    const color = isSelected ? '#dc2626' : '#facc15'; // Crimson or Yellow

    ctx.save();
    
    // Add a gentle shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;

    ctx.translate(x, y);
    ctx.rotate(((rotation ?? 0) * Math.PI) / 180);
    
    // Scale and center the icon from the 24x24 viewBox
    ctx.scale(size / 24, size / 24);
    ctx.translate(-12, -12); // Center the icon
    
    ctx.fillStyle = color;
    ctx.fill(airplanePath);
    
    ctx.restore();
};

export const FlightCanvasLayer: React.FC<FlightCanvasLayerProps> = ({ flights, onSelectFlight, selectedFlightId }) => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const propsRef = useRef({ flights, onSelectFlight, selectedFlightId });
  propsRef.current = { flights, onSelectFlight, selectedFlightId };
  
  const flightsById = useMemo(() => {
    const map = new Map<string, Flight>();
    for (const flight of flights) {
      map.set(flight.unique_key, flight);
    }
    return map;
  }, [flights]);

  const drawFlights = useCallback(() => {
    if (!canvasRef.current || !map) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const bounds = map.getBounds();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const { flights: currentFlights, selectedFlightId: currentSelectedId } = propsRef.current;
    
    // Draw non-selected flights first
    currentFlights.forEach(flight => {
        if (flight.unique_key === currentSelectedId) return;
        const latLng = new L.LatLng(flight.latitude, flight.longitude);
        if (bounds.contains(latLng)) {
            const point = map.latLngToContainerPoint(latLng);
            drawAirplane(ctx, point.x, point.y, flight.track ?? 0, false);
        }
    });

    // Draw selected flight last to ensure it's on top
    if (currentSelectedId && flightsById.has(currentSelectedId)) {
        const selectedFlight = flightsById.get(currentSelectedId)!;
        const latLng = new L.LatLng(selectedFlight.latitude, selectedFlight.longitude);
        if (bounds.contains(latLng)) {
            const point = map.latLngToContainerPoint(latLng);
            drawAirplane(ctx, point.x, point.y, selectedFlight.track ?? 0, true);
        }
    }
  }, [map, flightsById]);


  // Effect for redrawing when data changes
  useEffect(() => {
    drawFlights();
  }, [flights, selectedFlightId, drawFlights]);

  // Effect for setting up the canvas layer and events. Runs only once.
  useEffect(() => {
    if (!map) return;

    const canvas = L.DomUtil.create('canvas', 'leaflet-canvas-layer');
    canvasRef.current = canvas;
    const pane = map.getPane('overlayPane');
    if(pane) {
      pane.appendChild(canvas);
    }
    
    const onMove = () => {
        if (!canvasRef.current) return;
        const currentCanvas = canvasRef.current;
        const mapSize = map.getSize();
        
        if (currentCanvas.width !== mapSize.x || currentCanvas.height !== mapSize.y) {
            currentCanvas.width = mapSize.x;
            currentCanvas.height = mapSize.y;
        }

        const topLeft = map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(currentCanvas, topLeft);
        
        drawFlights();
    };

    const onClick = (e: L.LeafletMouseEvent) => {
        const point = e.containerPoint;
        let clickedFlight: Flight | null = null;
        const clickRadius = 20; // Increased radius for easier clicking
        let minDistance = Infinity;

        const { flights: currentFlights, onSelectFlight: currentOnSelectFlight } = propsRef.current;
        
        for (const flight of currentFlights) {
            const flightPoint = map.latLngToContainerPoint(new L.LatLng(flight.latitude, flight.longitude));
            const distance = point.distanceTo(flightPoint);
             
            if (distance < clickRadius && distance < minDistance) {
                 clickedFlight = flight;
                 minDistance = distance;
            }
        }
        
        if (clickedFlight) {
            currentOnSelectFlight(clickedFlight);
        }
    };
    
    map.on('move', onMove);
    map.on('resize', onMove);
    map.on('click', onClick);

    onMove(); // Initial draw

    return () => {
        map.off('move', onMove);
        map.off('resize', onMove);
        map.off('click', onClick);
        if (canvasRef.current) {
            L.DomUtil.remove(canvasRef.current);
            canvasRef.current = null;
        }
    };
  }, [map, drawFlights]);

  return null;
};
