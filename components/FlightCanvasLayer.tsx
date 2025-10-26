import React, { useEffect, useRef, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Flight } from '../types';

interface FlightCanvasLayerProps {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
  selectedFlightId: string | null;
}

interface RenderedFlight {
  x: number;
  y: number;
  flight: Flight;
}

interface RenderedCluster {
    x: number;
    y: number;
    count: number;
    bounds: L.LatLngBounds;
    radius: number;
}

const airplanePath = new Path2D("M20.25 12.375L22.5 10.125L12.375 0L10.125 2.25L13.018 5.142L5.803 12.358L2.25 10.125L0 12.375L10.125 22.5L12.375 20.25L8.821 16.696L16.036 9.482L18.928 12.375L20.25 12.375Z");
const airplaneSize = 24;
const CLICK_RADIUS = 15;

export const FlightCanvasLayer: React.FC<FlightCanvasLayerProps> = ({ flights, onSelectFlight, selectedFlightId }) => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderedFlightsRef = useRef<RenderedFlight[]>([]);
  const renderedClustersRef = useRef<RenderedCluster[]>([]);
  const animationFrameId = useRef<number | null>(null);

  const draw = useCallback(() => {
    if (!canvasRef.current || !map) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = map.getSize();
    if (canvas.width !== size.x || canvas.height !== size.y) {
        canvas.width = size.x;
        canvas.height = size.y;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const mapBounds = map.getBounds();
    const zoom = map.getZoom();
    
    const visibleFlights: Flight[] = [];
    for (const flight of flights) {
        if (mapBounds.contains(L.latLng(flight.lat, flight.lon))) {
            visibleFlights.push(flight);
        }
    }

    renderedFlightsRef.current = [];
    renderedClustersRef.current = [];

    // New logic: Only cluster if there are 100 or more flights in view
    if (visibleFlights.length < 100) {
        // Draw all visible flights as individual planes
        for (const flight of visibleFlights) {
            const point = map.latLngToContainerPoint(L.latLng(flight.lat, flight.lon));
            renderedFlightsRef.current.push({ x: point.x, y: point.y, flight });
            
            ctx.save();
            ctx.translate(point.x, point.y);
            ctx.rotate(flight.heading * Math.PI / 180);

            const isSelected = flight.id === selectedFlightId;
            ctx.fillStyle = isSelected ? '#06b6d4' : 'rgba(255, 255, 255, 0.9)';
            ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(0, 0, 0, 0.7)';
            ctx.lineWidth = 1;

            const scale = Math.max(0.4, Math.min(1.2, zoom / 5));

            ctx.scale(scale, scale);
            ctx.translate(-airplaneSize / 2, -airplaneSize / 2);

            ctx.fill(airplanePath);
            ctx.stroke(airplanePath);
            ctx.restore();
        }
    } else {
        // Original clustering logic for >= 100 flights
        const cellSize = Math.max(80, 180 - zoom * 10);
        const clusters = new Map<string, Flight[]>();

        for (const flight of visibleFlights) {
            const point = map.latLngToContainerPoint(L.latLng(flight.lat, flight.lon));
            const key = `${Math.floor(point.x / cellSize)}|${Math.floor(point.y / cellSize)}`;
            if (!clusters.has(key)) {
                clusters.set(key, []);
            }
            clusters.get(key)!.push(flight);
        }

        for (const clusterFlights of clusters.values()) {
            if (clusterFlights.length === 0) continue;
            
            if (clusterFlights.length > 1 && zoom < 10) {
                const clusterBounds = L.latLngBounds(clusterFlights.map(f => [f.lat, f.lon]));
                const centerPoint = map.latLngToContainerPoint(clusterBounds.getCenter());
                const count = clusterFlights.length;
                const radius = 15 + Math.log(count) * 2;
                
                renderedClustersRef.current.push({ x: centerPoint.x, y: centerPoint.y, count, bounds: clusterBounds, radius });

                let color = '#0ea5e9';
                if (count > 100) color = '#f97316';
                if (count > 500) color = '#ef4444';

                ctx.beginPath();
                ctx.arc(centerPoint.x, centerPoint.y, radius, 0, 2 * Math.PI);
                ctx.fillStyle = `${color}B3`;
                ctx.fill();
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = 'bold 12px Inter, sans-serif';
                ctx.fillText(count.toString(), centerPoint.x, centerPoint.y);
            } else {
                for (const flight of clusterFlights) {
                    const point = map.latLngToContainerPoint(L.latLng(flight.lat, flight.lon));
                    renderedFlightsRef.current.push({ x: point.x, y: point.y, flight });
                    
                    ctx.save();
                    ctx.translate(point.x, point.y);
                    ctx.rotate(flight.heading * Math.PI / 180);

                    const isSelected = flight.id === selectedFlightId;
                    ctx.fillStyle = isSelected ? '#06b6d4' : 'rgba(255, 255, 255, 0.9)';
                    ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(0, 0, 0, 0.7)';
                    ctx.lineWidth = 1;

                    const scale = Math.max(0.4, Math.min(1.2, zoom / 5));

                    ctx.scale(scale, scale);
                    ctx.translate(-airplaneSize / 2, -airplaneSize / 2);

                    ctx.fill(airplanePath);
                    ctx.stroke(airplanePath);
                    ctx.restore();
                }
            }
        }
    }
  }, [map, flights, selectedFlightId]);
  
  const scheduleDraw = useCallback(() => {
      if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
      }
      animationFrameId.current = requestAnimationFrame(draw);
  }, [draw]);

  useEffect(() => {
    scheduleDraw();
  }, [flights, selectedFlightId, scheduleDraw]);

  useEffect(() => {
    if (!map) return;
    const canvas = L.DomUtil.create('canvas', 'leaflet-zoom-animated');
    map.getPane('overlayPane')?.appendChild(canvas);
    canvasRef.current = canvas;
    
    const updateCanvasPosition = () => {
      if (!canvasRef.current) return;
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(canvasRef.current, topLeft);
      scheduleDraw();
    };

    map.on('viewreset move zoom', updateCanvasPosition);
    updateCanvasPosition();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if (canvasRef.current) L.DomUtil.remove(canvasRef.current);
      map.off('viewreset move zoom', updateCanvasPosition);
      canvasRef.current = null;
    };
  }, [map, scheduleDraw]);

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
        const clickPoint = e.containerPoint;
        
        for (const cluster of renderedClustersRef.current) {
            const dx = clickPoint.x - cluster.x;
            const dy = clickPoint.y - cluster.y;
            if (dx * dx + dy * dy <= cluster.radius * cluster.radius) {
                map.flyToBounds(cluster.bounds, { paddingTopLeft: L.point(50, 50), paddingBottomRight: L.point(50, 50) });
                return;
            }
        }

        let foundFlight: Flight | null = null;
        let minDistanceSq = CLICK_RADIUS * CLICK_RADIUS;

        for (const fp of renderedFlightsRef.current) {
          const dx = clickPoint.x - fp.x;
          const dy = clickPoint.y - fp.y;
          const distanceSq = dx * dx + dy * dy;

          if (distanceSq < minDistanceSq) {
            minDistanceSq = distanceSq;
            foundFlight = fp.flight;
          }
        }
        
        if (foundFlight) {
          onSelectFlight(foundFlight);
        }
    };

    map.on('click', handleClick);
    return () => { map.off('click', handleClick); };
  }, [map, onSelectFlight]);

  return null;
};