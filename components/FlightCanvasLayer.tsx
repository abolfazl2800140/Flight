import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Flight } from '../types';

interface FlightCanvasLayerProps {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
  selectedFlightId: string | null;
}

const AIRPLANE_PATH_STRING = "M20.25 12.375L22.5 10.125L12.375 0L10.125 2.25L13.018 5.142L5.803 12.358L2.25 10.125L0 12.375L10.125 22.5L12.375 20.25L8.821 16.696L16.036 9.482L18.928 12.375L20.25 12.375Z";
const airplanePath = new Path2D(AIRPLANE_PATH_STRING);
const ICON_SIZE = 14;
const CLICK_TOLERANCE = ICON_SIZE / 2;


// This is a custom Leaflet layer to render flights on canvas for performance
// We are extending L.Layer and implementing the required methods.
declare module 'leaflet' {
    export class CanvasLayer extends Layer {
        constructor(options?: any);
        updateFlights(flights: Flight[], selectedFlightId: string | null): void;
    }
}

// @ts-ignore
L.CanvasLayer = L.Layer.extend({
  initialize: function (options: any) {
    L.setOptions(this, options);
  },

  onAdd: function (map: L.Map) {
    this._map = map;
    this._canvas = L.DomUtil.create('canvas', 'leaflet-layer');
    
    const size = this._map.getSize();
    this._canvas.width = size.x;
    this._canvas.height = size.y;

    const animated = this._map.options.zoomAnimation && L.Browser.any3d;
    L.DomUtil.addClass(this._canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));

    map.getPanes().overlayPane.appendChild(this._canvas);

    map.on('moveend', this._reset, this);
    map.on('click', this._onClick, this);

    if (map.options.zoomAnimation && L.Browser.any3d) {
        map.on('zoomanim', this._animateZoom, this);
    }

    this._reset();
  },

  onRemove: function (map: L.Map) {
    map.getPanes().overlayPane.removeChild(this._canvas);
    map.off('moveend', this._reset, this);
    map.off('click', this._onClick, this);
    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.off('zoomanim', this._animateZoom, this);
    }
  },

  _animateZoom: function(e: L.ZoomAnimEvent) {
    const scale = this._map.getZoomScale(e.zoom);
    // @ts-ignore
    const offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

    if (L.DomUtil.setTransform) {
        L.DomUtil.setTransform(this._canvas, offset, scale);
    } else {
        // @ts-ignore
        this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';
    }
  },

  _reset: function () {
    const topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, topLeft);

    const size = this._map.getSize();
    if (this._canvas.width !== size.x) {
      this._canvas.width = size.x;
    }
    if (this._canvas.height !== size.y) {
      this._canvas.height = size.y;
    }
    
    this._redraw();
  },
  
  _onClick: function (e: L.LeafletMouseEvent) {
    const point = e.layerPoint;
    const flights: Flight[] = this.options.flights || [];
    
    // Iterate in reverse to find top-most flight
    for (let i = flights.length - 1; i >= 0; i--) {
        const flight = flights[i];
        const flightPoint = this._map.latLngToLayerPoint([flight.latitude, flight.longitude]);
        
        const dx = point.x - flightPoint.x;
        const dy = point.y - flightPoint.y;
        
        if (Math.abs(dx) <= CLICK_TOLERANCE && Math.abs(dy) <= CLICK_TOLERANCE) {
            this.options.onSelectFlight(flight);
            return;
        }
    }
  },

  _redraw: function () {
    const ctx = this._canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

    const flights: Flight[] = this.options.flights || [];
    const bounds = this._map.getPixelBounds();
    const selectedFlightId = this.options.selectedFlightId;

    flights.forEach(flight => {
      const pos = this._map.latLngToLayerPoint(new L.LatLng(flight.latitude, flight.longitude));
      
      if (bounds.contains(pos)) {
        this._drawFlight(ctx, pos, flight, selectedFlightId === flight.unique_key);
      }
    });
  },

  _drawFlight: function(ctx: CanvasRenderingContext2D, pos: L.Point, flight: Flight, isSelected: boolean) {
    const angle = ((flight.track || 0) - 45) * Math.PI / 180; // Icon is naturally rotated -45deg, adjust for that.

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle);
    ctx.scale(ICON_SIZE / 24, ICON_SIZE / 24); // Scale based on original SVG viewbox size
    ctx.translate(-12, -12); // Center the icon

    if (isSelected) {
        ctx.fillStyle = '#fef08a'; // yellow-200
        ctx.shadowColor = '#fef08a';
        ctx.shadowBlur = 10;
    } else {
        ctx.fillStyle = '#22d3ee'; // cyan-400
        ctx.shadowColor = 'rgba(0,0,0,0)';
        ctx.shadowBlur = 0;
    }

    ctx.fill(airplanePath);
    ctx.restore();
  },
  
  updateFlights: function(flights: Flight[], selectedFlightId: string | null) {
    this.options.flights = flights;
    this.options.selectedFlightId = selectedFlightId;
    this._redraw();
  },
});

export const FlightCanvasLayer: React.FC<FlightCanvasLayerProps> = ({ flights, onSelectFlight, selectedFlightId }) => {
  const map = useMap();
  const layerRef = useRef<L.CanvasLayer | null>(null);

  useEffect(() => {
    if (!layerRef.current) {
        // @ts-ignore
        layerRef.current = new L.CanvasLayer({
            flights: flights,
            onSelectFlight: onSelectFlight,
            selectedFlightId: selectedFlightId,
        });
        layerRef.current.addTo(map);
    }
    
    const currentLayer = layerRef.current;
    return () => {
        if (currentLayer) {
            currentLayer.removeFrom(map);
            layerRef.current = null;
        }
    };
  }, [map, onSelectFlight]);

  useEffect(() => {
    if (layerRef.current) {
        layerRef.current.updateFlights(flights, selectedFlightId);
    }
  }, [flights, selectedFlightId]);

  return null;
};
