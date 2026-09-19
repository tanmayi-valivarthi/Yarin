import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, ArrowRight, Zap, Clock, MapPin, Truck } from 'lucide-react';
import { useStore } from '@/store';
import { PageHeader, Card, SectionTitle, Alert, Button } from '@/components/ui';
import PriorityBadge from '@/components/PriorityBadge';
import WhyButton from '@/components/WhyButton';
import MapView from '@/components/MapView';

export default function ResponsePage() {
  const { emergencies, resources, roads, shelters, hospitals, hazardZones, assignResource } = useStore();

  const critical = emergencies.filter((e) => e.priority === 'critical' && e.status !== 'resolved');
  const active = emergencies.filter((e) => e.status === 'en_route' || e.status === 'resource_assigned');
  const recentChanges = [
    { text: 'Road R12 partially blocked', level: 'high' as const },
    { text: 'Hospital H-02 nearing capacity', level: 'high' as const },
    { text: 'New critical SOS received — E-104', level: 'critical' as const },
  ];

  const availableVehicles = resources.filter(
    (r) => r.kind === 'rescue_vehicle' && r.status === 'available',
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <PageHeader
        title="Operations Center"
        subtitle="Coordinate disaster response — decisions and actions"
        icon={<Activity className="h-6 w-6" />}
      />

      <div className="grid gap-4 lg:grid-cols-[220px_1fr_340px]">
        {/* Left: quick nav */}
        <div className="hidden lg:block">
          <Card>
            <SectionTitle className="mb-3">Navigation</SectionTitle>
            <div className="space-y-1">
              {[
                { label: 'Action Required', href: '#action' },
                { label: 'Active Response', href: '#active' },
                { label: 'Live Map', href: '#map' },
                { label: 'Recent Changes', href: '#changes' },
                { label: 'Competing Emergencies', href: '/competing' },
                { label: 'Replanning Demo', href: '/replanning' },
                { label: 'Demand Prediction', href: '#demand' },
              ].map((n) => (
                <a
                  key={n.label}
                  href={n.href}
                  className="block rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                >
                  {n.label}
                </a>
              ))}
            </div>
          </Card>
        </div>

        {/* Center: map */}
        <div id="map" className="space-y-4">
          <MapView
            emergencies={emergencies}
            resources={resources}
            roads={roads}
            shelters={shelters}
            hospitals={hospitals}
            hazardZones={hazardZones}
            height="480px"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Active emergencies" value={emergencies.filter((e) => e.status !== 'resolved').length} color="text-red-600" />
            <Stat label="En route" value={active.length} color="text-blue-600" />
            <Stat label="Available vehicles" value={availableVehicles.length} color="text-green-600" />
            <Stat label="Blocked roads" value={roads.filter((r) => r.blocked).length} color="text-orange-600" />
          </div>
        </div>

        {/* Right: action panel */}
        <div className="space-y-4">
          <div id="action">
            <Alert variant="critical" title="ACTION REQUIRED">
              <p className="font-semibold">{critical.length} emergencies require immediate attention.</p>
              {critical[0] && (
                <div className="mt-2 rounded-md bg-white/60 p-2.5">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={critical[0].priority} size="sm" />
                    <span className="text-xs font-bold">{critical[0].id}</span>
                  </div>
                  <p className="mt-1 text-xs">{critical[0].description}</p>
                  <p className="mt-2 text-xs font-medium text-blue-700">
                    Recommended: Deploy Rescue Team R-04 to {critical[0].location}.
                  </p>
                  <WhyButton
                    reasons={[
                      'Emergency priority: Critical',
                      'Nearest available resource',
                      'Suitable capacity for 6 people',
                      'Accessible route confirmed',
                    ]}
                    label="View reason"
                  />
                  <div className="mt-1 flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => assignResource(critical[0].id, 'R-04')}
                    >
                      <Zap className="h-3.5 w-3.5" /> Approve / Assign
                    </Button>
                    <Link to="/resources">
                      <Button size="sm" variant="secondary">View Resources</Button>
                    </Link>
                  </div>
                </div>
              )}
            </Alert>
          </div>

          {/* Active response */}
          <Card>
            <SectionTitle className="mb-3">Active Response</SectionTitle>
            <div className="space-y-2">
              {active.map((e) => (
                <div key={e.id} className="flex items-center gap-2 rounded-lg border border-gray-100 p-2 text-sm">
                  <Truck className="h-4 w-4 shrink-0 text-cyan-600" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-800">
                      {e.assignedResource ?? e.assignedTeam ?? 'Unassigned'} → {e.location}
                    </div>
                    <div className="text-xs text-gray-400">
                      {e.id} · {e.eta ? `ETA ${e.eta} min` : 'calculating…'}
                    </div>
                  </div>
                  <PriorityBadge priority={e.priority} size="sm" />
                </div>
              ))}
              {active.length === 0 && <p className="text-sm text-gray-400">No active responses.</p>}
            </div>
          </Card>

          {/* Recent changes */}
          <Card className="changes">
            <SectionTitle className="mb-3">Recent Changes</SectionTitle>
            <div className="space-y-2">
              {recentChanges.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                    c.level === 'critical' ? 'text-red-500' : 'text-orange-500'
                  }`} />
                  <span className="text-gray-700">{c.text}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Demand prediction */}
          <Card className="demand">
            <SectionTitle className="mb-3">Predicted Demand — Next 2 Hours</SectionTitle>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Shelter demand', value: 'High', color: 'text-red-600' },
                { label: 'Medical demand', value: 'Medium → Increasing', color: 'text-orange-600' },
                { label: 'Water demand', value: 'High', color: 'text-red-600' },
              ].map((d) => (
                <div key={d.label} className="flex justify-between">
                  <span className="text-gray-600">{d.label}</span>
                  <span className={`font-semibold ${d.color}`}>{d.value}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-gray-400">
              ESTIMATED — based on current reports, affected population, resource utilization & trends.
            </p>
          </Card>

          <Link to="/replanning" className="block">
            <Button variant="danger" className="w-full">
              <Activity className="h-4 w-4" /> Dynamic Replanning Demo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card className="text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </Card>
  );
}
