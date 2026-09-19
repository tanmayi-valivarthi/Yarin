import { useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type {
  Emergency,
  HazardZone,
  Hospital,
  LatLng,
  Resource,
  Road,
  Shelter,
} from '@/types';
import { MAP_CENTER, MAP_ZOOM } from '@/data';

// Fix default marker icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function makeIcon(color: string, emoji?: string) {
  return L.divIcon({
    className: 'resq-marker',
    html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:12px">${emoji ?? ''}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

const emergencyIcon = (priority: string) =>
  makeIcon(
    priority === 'critical' ? '#dc2626' : priority === 'high' ? '#ea580c' : '#ca8a04',
    '!',
  );
const hospitalIcon = makeIcon('#2563eb', 'H');
const shelterIcon = makeIcon('#7c3aed', 'S');
const rescueIcon = makeIcon('#0891b2', 'R');
const boatIcon = makeIcon('#0891b2', 'B');
const ambulanceIcon = makeIcon('#2563eb', 'A');
const medicalIcon = makeIcon('#2563eb', 'M');

function FitBounds({ emergencies }: { emergencies: Emergency[] }) {
  const map = useMap();
  useMemo(() => {
    if (emergencies.length === 0) return;
    const bounds = L.latLngBounds(
      emergencies.map((e) => [e.coords.lat, e.coords.lng] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
  }, [emergencies, map]);
  return null;
}

export default function MapView({
  emergencies = [],
  resources = [],
  roads = [],
  shelters = [],
  hospitals = [],
  hazardZones = [],
  showLegend = true,
  height = '100%',
  focus,
}: {
  emergencies?: Emergency[];
  resources?: Resource[];
  roads?: Road[];
  shelters?: Shelter[];
  hospitals?: Hospital[];
  hazardZones?: HazardZone[];
  showLegend?: boolean;
  height?: string;
  focus?: LatLng;
}) {
  const center: [number, number] = focus
    ? [focus.lat, focus.lng]
    : [MAP_CENTER[0], MAP_CENTER[1]];

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100" style={{ height }}>
      <MapContainer
        center={center}
        zoom={focus ? 16 : MAP_ZOOM}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds emergencies={emergencies} />

        {/* Hazard zones */}
        {hazardZones.map((z) => (
          <Circle
            key={z.id}
            center={[z.center.lat, z.center.lng]}
            radius={z.radius}
            pathOptions={{
              color: z.type === 'flood' ? '#0284c7' : z.type === 'forest_fire' ? '#dc2626' : '#ea580c',
              fillColor: z.type === 'flood' ? '#38bdf8' : z.type === 'forest_fire' ? '#f87171' : '#fb923c',
              fillOpacity: 0.25,
            }}
          >
            <Popup>
              <div className="text-xs">
                <strong>{z.label}</strong>
                <br />
                Radius: {Math.round(z.radius)}m
                {z.expanding && <br />}
                {z.expanding && <span className="text-orange-600">Hazard zone expanding!</span>}
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Roads */}
        {roads.map((r) => (
          <Polyline
            key={r.id}
            positions={r.path.map((p) => [p.lat, p.lng])}
            pathOptions={{
              color: r.blocked ? '#dc2626' : r.conflict ? '#ca8a04' : '#6b7280',
              weight: 4,
              dashArray: r.blocked ? '8 6' : undefined,
              opacity: 0.8,
            }}
          >
            <Popup>
              <div className="text-xs">
                <strong>{r.name}</strong>
                <br />
                {r.blocked ? 'Blocked' : r.conflict ? 'Conflicting reports — needs verification' : 'Accessible'}
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Emergencies */}
        {emergencies.map((e) => (
          <Marker
            key={e.id}
            position={[e.coords.lat, e.coords.lng]}
            icon={emergencyIcon(e.priority)}
          >
            <Popup>
              <div className="text-xs space-y-0.5 min-w-[160px]">
                <strong>{e.id}</strong> — <span className="uppercase">{e.priority}</span>
                <br />
                {e.location}
                <br />
                {e.peopleAffected} people · {e.injured ? 'Injured' : 'No injuries'}
                <br />
                <span className="text-gray-500">Status: {e.status.replace('_', ' ')}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Resources */}
        {resources.map((r) => {
          let icon = rescueIcon;
          if (r.kind === 'boat') icon = boatIcon;
          else if (r.kind === 'ambulance') icon = ambulanceIcon;
          else if (r.kind === 'medical_team') icon = medicalIcon;
          else return null;
          return (
            <Marker key={r.id} position={[r.coords.lat, r.coords.lng]} icon={icon}>
              <Popup>
                <div className="text-xs">
                  <strong>{r.name}</strong>
                  <br />
                  {r.status.replace('_', ' ')}
                  {r.assignedTo && <><br />Assigned: {r.assignedTo}</>}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Shelters */}
        {shelters.map((s) => (
          <Marker key={s.id} position={[s.coords.lat, s.coords.lng]} icon={shelterIcon}>
            <Popup>
              <div className="text-xs">
                <strong>{s.name}</strong>
                <br />
                Occupancy: {s.occupancy}/{s.capacity}
                <br />
                Incoming: {s.incoming}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Hospitals */}
        {hospitals.map((h) => (
          <Marker key={h.id} position={[h.coords.lat, h.coords.lng]} icon={hospitalIcon}>
            <Popup>
              <div className="text-xs">
                <strong>{h.name}</strong>
                <br />
                ER beds: {h.emergencyBeds}/{h.emergencyBedsTotal}
                <br />
                ICU: {h.icu}/{h.icuTotal}
                <br />
                Incoming: {h.incoming}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {showLegend && (
        <div className="absolute bottom-3 left-3 z-[1000] rounded-lg border border-gray-200 bg-white/95 p-2.5 text-[10px] shadow-md backdrop-blur">
          <div className="mb-1 font-bold text-gray-700">LEGEND</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <LegendDot color="#dc2626" label="Critical" />
            <LegendDot color="#ea580c" label="High priority" />
            <LegendDot color="#2563eb" label="Medical / Hospital" />
            <LegendDot color="#7c3aed" label="Shelter" />
            <LegendDot color="#0891b2" label="Rescue / Boat" />
            <LegendDot color="#6b7280" label="Road" />
            <LegendDot color="#dc2626" label="Blocked road" dashed />
            <LegendDot color="#0284c7" label="Hazard zone" circle />
          </div>
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label, dashed, circle }: { color: string; label: string; dashed?: boolean; circle?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {circle ? (
        <div className="h-3 w-3 rounded-full border" style={{ borderColor: color, background: `${color}40` }} />
      ) : (
        <div
          className="h-1 w-4 rounded"
          style={{
            background: dashed ? `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 7px)` : color,
          }}
        />
      )}
      <span className="text-gray-600">{label}</span>
    </div>
  );
}
