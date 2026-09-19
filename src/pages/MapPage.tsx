import { useState } from 'react';
import { Map as MapIcon, Layers, Filter, Waves, Wind, Mountain, Flame, Droplets } from 'lucide-react';
import { useStore } from '@/store';
import { PageHeader, Card, SectionTitle, Alert } from '@/components/ui';
import MapView from '@/components/MapView';
import type { DisasterType } from '@/types';

const disasterFilters: { id: DisasterType | 'all'; label: string; icon: typeof Waves }[] = [
  { id: 'all', label: 'All', icon: Layers },
  { id: 'flood', label: 'Flood', icon: Waves },
  { id: 'cyclone', label: 'Cyclone', icon: Wind },
  { id: 'earthquake', label: 'Earthquake', icon: Mountain },
  { id: 'forest_fire', label: 'Forest Fire', icon: Flame },
];

const layers = [
  { id: 'emergencies', label: 'Emergencies' },
  { id: 'roads', label: 'Roads' },
  { id: 'shelters', label: 'Shelters' },
  { id: 'hospitals', label: 'Hospitals' },
  { id: 'resources', label: 'Rescue Resources' },
  { id: 'hazards', label: 'Hazard Zones' },
];

export default function MapPage() {
  const { emergencies, resources, roads, shelters, hospitals, hazardZones } = useStore();
  const [disasterFilter, setDisasterFilter] = useState<DisasterType | 'all'>('all');
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>(
    Object.fromEntries(layers.map((l) => [l.id, true])),
  );

  const filteredEmergencies =
    disasterFilter === 'all' ? emergencies : emergencies.filter((e) => e.disasterType === disasterFilter);

  const toggleLayer = (id: string) => setVisibleLayers((prev) => ({ ...prev, [id]: !prev[id] }));

  const blockedRoads = roads.filter((r) => r.blocked);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <PageHeader
        title="Disaster Map"
        subtitle="Live situation awareness — roads, hazards, emergencies & resources"
        icon={<MapIcon className="h-6 w-6" />}
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          <Filter className="h-4 w-4" /> Disaster:
        </div>
        {disasterFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => setDisasterFilter(f.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              disasterFilter === f.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <f.icon className="h-3.5 w-3.5" />
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        {/* Map */}
        <div>
          <MapView
            emergencies={visibleLayers.emergencies ? filteredEmergencies : []}
            resources={visibleLayers.resources ? resources : []}
            roads={visibleLayers.roads ? roads : []}
            shelters={visibleLayers.shelters ? shelters : []}
            hospitals={visibleLayers.hospitals ? hospitals : []}
            hazardZones={visibleLayers.hazards ? hazardZones : []}
            height="600px"
          />
        </div>

        {/* Sidebar: layers + info */}
        <div className="space-y-4">
          <Card>
            <SectionTitle className="mb-3">Map Layers</SectionTitle>
            <div className="space-y-1.5">
              {layers.map((l) => (
                <label key={l.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleLayers[l.id]}
                    onChange={() => toggleLayer(l.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{l.label}</span>
                </label>
              ))}
            </div>
          </Card>

          {blockedRoads.length > 0 && (
            <Alert variant="critical" title="Blocked Roads">
              {blockedRoads.map((r) => (
                <div key={r.id} className="flex items-center gap-1.5 text-xs">
                  <Droplets className="h-3 w-3" /> {r.name} — {r.conflict ? 'Conflicting reports' : 'Blocked'}
                </div>
              ))}
            </Alert>
          )}

          {hazardZones.filter((z) => z.expanding).length > 0 && (
            <Alert variant="warning" title="Hazard Zone Expanded">
              Flood boundary has expanded. Nearby routes and emergencies are being reassessed.
            </Alert>
          )}

          <Card>
            <SectionTitle className="mb-2">Disaster-Specific Info</SectionTitle>
            <div className="space-y-1.5 text-xs text-gray-600">
              {disasterFilter === 'flood' || disasterFilter === 'all' ? (
                <>
                  <div>• Water level rising in Zone A</div>
                  <div>• Boats deployed to Flood Zone C</div>
                  <div>• Evacuation routes via Road R09</div>
                </>
              ) : disasterFilter === 'cyclone' ? (
                <>
                  <div>• Storm warning active</div>
                  <div>• Evacuation in progress</div>
                </>
              ) : disasterFilter === 'earthquake' ? (
                <>
                  <div>• Collapsed buildings in Sector 3</div>
                  <div>• Search & rescue teams deployed</div>
                </>
              ) : (
                <>
                  <div>• Monitor hazard zones on map</div>
                  <div>• Follow evacuation advisories</div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
