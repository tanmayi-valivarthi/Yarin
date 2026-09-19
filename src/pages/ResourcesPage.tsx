import { Package, Filter, MapPin, Truck, Sailboat, Ambulance, Stethoscope, Apple, Droplets, Pill, Users, Home } from 'lucide-react';
import { useStore } from '@/store';
import { PageHeader, Card, SectionTitle } from '@/components/ui';
import type { ResourceKind, ResourceStatus } from '@/types';
import { useState } from 'react';

const kindMeta: Record<ResourceKind, { label: string; icon: typeof Truck }> = {
  rescue_vehicle: { label: 'Rescue Vehicles', icon: Truck },
  boat: { label: 'Boats', icon: Sailboat },
  ambulance: { label: 'Ambulances', icon: Ambulance },
  medical_team: { label: 'Medical Teams', icon: Stethoscope },
  food: { label: 'Food', icon: Apple },
  water: { label: 'Water', icon: Droplets },
  medicines: { label: 'Medicines', icon: Pill },
  volunteers: { label: 'Volunteers', icon: Users },
  shelter: { label: 'Shelters', icon: Home },
};

const statusStyle: Record<ResourceStatus, string> = {
  available: 'bg-green-100 text-green-700',
  assigned: 'bg-blue-100 text-blue-700',
  unavailable: 'bg-red-100 text-red-700',
  low_stock: 'bg-orange-100 text-orange-700',
};

export default function ResourcesPage() {
  const { resources } = useStore();
  const [filter, setFilter] = useState<ResourceKind | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  const locations = Array.from(new Set(resources.map((r) => r.location)));
  const filtered = resources
    .filter((r) => filter === 'all' || r.kind === filter)
    .filter((r) => locationFilter === 'all' || r.location === locationFilter);

  const grouped: Record<string, typeof resources> = {};
  filtered.forEach((r) => {
    grouped[r.kind] = grouped[r.kind] ?? [];
    grouped[r.kind].push(r);
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <PageHeader
        title="Resource Management"
        subtitle="Track availability and allocation of response resources"
        icon={<Package className="h-6 w-6" />}
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          <Filter className="h-4 w-4" /> Type:
        </div>
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-3 py-1 text-xs font-medium ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          All
        </button>
        {Object.entries(kindMeta).map(([id, m]) => (
          <button
            key={id}
            onClick={() => setFilter(id as ResourceKind)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
              filter === id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <m.icon className="h-3.5 w-3.5" />
            {m.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-500">Location:</span>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="all">All locations</option>
          {locations.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Resource groups */}
      <div className="space-y-5">
        {Object.entries(grouped).map(([kind, items]) => {
          const meta = kindMeta[kind as ResourceKind];
          return (
            <div key={kind}>
              <SectionTitle className="mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <meta.icon className="h-4 w-4" /> {meta.label}
                </span>
              </SectionTitle>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((r) => (
                  <Card key={r.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                          <meta.icon className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{r.name}</div>
                          <div className="flex items-center gap-0.5 text-xs text-gray-400">
                            <MapPin className="h-3 w-3" /> {r.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyle[r.status]}`}>
                        {r.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      {r.capacity && <span className="text-xs text-gray-400">Cap: {r.capacity}</span>}
                    </div>
                    {r.assignedTo && (
                      <div className="mt-1.5 text-xs text-blue-600">Assigned to: {r.assignedTo}</div>
                    )}
                    {r.eta && r.status === 'available' && (
                      <div className="mt-1 text-xs text-gray-400">ETA: {r.eta} min · {r.distance} km</div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
