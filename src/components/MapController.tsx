import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLng } from '@/types';

export default function MapController({
  center,
  zoom,
}: {
  center?: LatLng;
  zoom?: number;
}) {
  const map = useMap();
  const ref = useRef(center);
  useEffect(() => {
    if (center && (center.lat !== ref.current?.lat || center.lng !== ref.current?.lng)) {
      map.flyTo([center.lat, center.lng], zoom ?? map.getZoom(), { duration: 0.8 });
      ref.current = center;
    }
  }, [center, zoom, map]);
  return null;
}

export function recenterMap(map: L.Map, center: LatLng, zoom?: number) {
  map.flyTo([center.lat, center.lng], zoom ?? map.getZoom(), { duration: 0.8 });
}
