import React, { useEffect, useRef, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Flight } from '../types';

interface FlightCanvasLayerProps {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
  selectedFlightId: string | null;
}

interface DrawnItem {
    type: 'flight' | 'cluster';
    center: L.Point; 
    radius: number;
    flight?: Flight;
    clusterFlights?: Flight[];
    bounds?: L.LatLngBounds; 
}

const airplanePath = new Path2D("M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13L21 16Z");

const drawAirplane = (ctx: CanvasRenderingContext2D, x: number, y: number, rotation: number, isSelected: boolean) => {
    const size = 26;
    const color = isSelected ? '#dc2626' : '#facc15'; // Crimson or Yellow

    ctx.save();
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;

    ctx.translate(x, y);
    ctx.rotate((rotation + 90) * Math.PI / 180); 
    
    const scale = size / 24; 
    ctx.scale(scale, scale);
    ctx.translate(-12, -12); 

    ctx.fillStyle = color;
    ctx.fill(airplanePath);
    
    ctx.restore();
};

const drawCluster = (ctx: CanvasRenderingContext2D, x: number, y: number, count: number, radius: number) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(2, 132, 199, 0.7)'; // cyan-600 with opacity
    ctx.fill();
    ctx.strokeStyle = 'rgba(14, 165, 233, 1)'; // cyan-500
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 13px Vazirmatn';
    ctx.fillText(count.toLocaleString('fa-IR'), x, y);
};

export const FlightCanvasLayer: React.FC<FlightCanvasLayerProps> = ({ flights, onSelectFlight, selectedFlightId }) => {
  const map = useMap();
  const canvasLayerRef = useRef<any>(null);

  const drawFlights = useCallback(() => {
    if (!canvasLayerRef.current) return;
    const layer = canvasLayerRef.current;
    const canvas = layer.getCanvas();
    const ctx = canvas.getContext('2d');
    const drawnItems: DrawnItem[] = [];
    layer.drawnItems = drawnItems;

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bounds = map.getBounds();
    const zoom = map.getZoom();

    const visibleFlights = flights.filter(f => bounds.contains([f.latitude, f.longitude]));

    // Clustering logic
    const CLUSTER_THRESHOLD = 100;
    const GRID_SIZE = 100; // pixels

    if (visibleFlights.length > CLUSTER_THRESHOLD && zoom < 10) {
        const grid: { [key: string]: Flight[] } = {};
        
        visibleFlights.forEach(flight => {
            const point = map.latLngToContainerPoint([flight.latitude, flight.longitude]);
            const key = `${Math.floor(point.x / GRID_SIZE)}_${Math.floor(point.y / GRID_SIZE)}`;
            if (!grid[key]) {
                grid[key] = [];
            }
            grid[key].push(flight);
        });

        Object.values(grid).forEach(cluster => {
            if (cluster.length > 1) {
                let sumLat = 0, sumLng = 0;
                cluster.forEach(f => {
                    sumLat += f.latitude;
                    sumLng += f.longitude;
                });
                const centerLatLng = new L.LatLng(sumLat / cluster.length, sumLng / cluster.length);
                const centerPoint = map.latLngToContainerPoint(centerLatLng);
                const radius = Math.min(40, 18 + Math.log2(cluster.length) * 3);

                drawCluster(ctx, centerPoint.x, centerPoint.y, cluster.length, radius);
                
                const clusterBounds = L.latLngBounds(cluster.map(f => [f.latitude, f.longitude]));

                drawnItems.push({
                    type: 'cluster',
                    center: centerPoint,
                    radius,
                    clusterFlights: cluster,
                    bounds: clusterBounds
                });
            } else {
                const flight = cluster[0];
                const point = map.latLngToContainerPoint([flight.latitude, flight.longitude]);
                drawAirplane(ctx, point.x, point.y, flight.track ?? 0, flight.unique_key === selectedFlightId);
                drawnItems.push({
                    type: 'flight',
                    center: point,
                    radius: 13,
                    flight
                });
            }
        });

    } else {
      visibleFlights.forEach(flight => {
        const point = map.latLngToContainerPoint([flight.latitude, flight.longitude]);
        drawAirplane(ctx, point.x, point.y, flight.track ?? 0, flight.unique_key === selectedFlightId);
        drawnItems.push({
            type: 'flight',
            center: point,
            radius: 13,
            flight
        });
      });
    }

  }, [flights, map, selectedFlightId]);

  useEffect(() => {
    if (canvasLayerRef.current) {
        drawFlights();
    }
  }, [drawFlights, flights, selectedFlightId]);


  useEffect(() => {
    const Lany = L as any;
    if (Lany.canvasLayer && !canvasLayerRef.current) {
      canvasLayerRef.current = Lany.canvasLayer();
      
      canvasLayerRef.current.delegate(
        {
          onDrawLayer: (info: any) => {
            drawFlights();
          },
          onClick: (event: L.LeafletMouseEvent, data: any) => {
            const point = event.containerPoint;
            const clickedItem = canvasLayerRef.current.drawnItems.find((item: DrawnItem) => {
                const dx = item.center.x - point.x;
                const dy = item.center.y - point.y;
                return dx * dx + dy * dy < item.radius * item.radius;
            });

            if (clickedItem) {
                if (clickedItem.type === 'flight' && clickedItem.flight) {
                    onSelectFlight(clickedItem.flight);
                } else if (clickedItem.type === 'cluster' && clickedItem.bounds) {
                    map.flyToBounds(clickedItem.bounds, { padding: [50, 50] });
                }
            }
          }
        }
      );
      
      canvasLayerRef.current.addTo(map);
    }

    return () => {
      if (canvasLayerRef.current) {
        canvasLayerRef.current.removeFrom(map);
        canvasLayerRef.current = null;
      }
    };
  }, [map, onSelectFlight, drawFlights]);

  return null;
};
