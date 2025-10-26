import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Flight } from '../types';

// Define constants for styling
const FLIGHT_COLOR = 'rgba(250, 204, 21, 1)'; // Tailwind yellow-400
const SELECTED_FLIGHT_COLOR = 'rgba(153, 27, 27, 1)'; // Zereshki / Deep Red (like Tailwind's red-800)
const CLICK_RADIUS = 18;

interface FlightCanvasLayerProps {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
  selectedFlightId: string | null;
}

// Custom Leaflet Layer for rendering flights on canvas
const CanvasLayer = L.Layer.extend({
  options: {
    flights: [] as Flight[],
    onSelectFlight: (flight: Flight) => {},
    selectedFlightId: null as string | null,
  },
  
  _airplanePath: new Path2D("M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13L21 16Z"),

  onAdd: function (map: L.Map) {
    this._map = map;
    this._canvas = L.DomUtil.create('canvas', 'leaflet-canvas-layer');
    this.getPane().appendChild(this._canvas);
    this._ctx = this._canvas.getContext('2d');
    this._resize();
    map.on('moveend', this._reset, this);
    map.on('click', this._handleClick, this);
    this._reset();
  },

  onRemove: function (map: L.Map) {
    if (this._canvas) {
        L.DomUtil.remove(this._canvas);
    }
    map.off('moveend', this._reset, this);
    map.off('click', this._handleClick, this);
  },

  setData: function (data: Partial<FlightCanvasLayerProps>) {
    this.options = { ...this.options, ...data };
    this._reset();
    return this;
  },

  _resize: function () {
    if (!this._map || !this._canvas) return;
    const size = this._map.getSize();
    this._canvas.width = size.x;
    this._canvas.height = size.y;
    this._canvas.style.width = size.x + 'px';
    this._canvas.style.height = size.y + 'px';
    const topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, topLeft);
  },

  _reset: function () {
    this._resize();
    this._draw();
  },

  _draw: function () {
    if (!this._ctx || !this._map || !this._canvas) return;
    const ctx = this._ctx;
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    const bounds = this._map.getBounds();
    this.options.flights.forEach((flight: Flight) => {
      const latLng = new L.LatLng(flight.latitude, flight.longitude);
      if (bounds.contains(latLng)) {
        const point = this._map.latLngToContainerPoint(latLng);
        this._drawAirplane(ctx, point, flight.track, flight.unique_key === this.options.selectedFlightId);
      }
    });
  },

  _drawAirplane: function (ctx: CanvasRenderingContext2D, point: L.Point, angle: number | null, isSelected: boolean) {
    const scale = 1.2;
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(((angle || 0) - 90) * Math.PI / 180);
    ctx.scale(scale, scale);
    ctx.translate(-12, -12);

    if (isSelected) {
      ctx.fillStyle = SELECTED_FLIGHT_COLOR;
      ctx.fill(this._airplanePath);
    } else {
      ctx.fillStyle = FLIGHT_COLOR;
      ctx.fill(this._airplanePath);
    }
    
    ctx.restore();
  },

  _handleClick: function (e: L.LeafletMouseEvent) {
    if (!this._map) return;
    const point = e.containerPoint;
    const bounds = this._map.getBounds();
    let clickedFlight: Flight | null = null;
    let minDistance = CLICK_RADIUS * CLICK_RADIUS;
    this.options.flights.forEach((flight: Flight) => {
        const latLng = new L.LatLng(flight.latitude, flight.longitude);
        if (bounds.contains(latLng)) {
            const flightPoint = this._map.latLngToContainerPoint(latLng);
            const dx = point.x - flightPoint.x;
            const dy = point.y - flightPoint.y;
            const distanceSq = dx * dx + dy * dy;
            if (distanceSq < minDistance) {
                minDistance = distanceSq;
                clickedFlight = flight;
            }
        }
    });
    if (clickedFlight) {
        this.options.onSelectFlight(clickedFlight);
    }
  },
});

export const FlightCanvasLayer: React.FC<FlightCanvasLayerProps> = ({ flights, onSelectFlight, selectedFlightId }) => {
  const map = useMap();
  const layerRef = useRef<any>(null);

  useEffect(() => {
    const layer = new (CanvasLayer as any)({
      flights,
      onSelectFlight,
      selectedFlightId,
    });
    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.setData({ flights, onSelectFlight, selectedFlightId });
    }
  }, [flights, onSelectFlight, selectedFlightId]);

  return null;
};