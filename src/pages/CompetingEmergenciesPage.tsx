import { AlertTriangle, Users, Heart, Accessibility, Clock, MapPin, Truck, Zap } from 'lucide-react';
import { useStore } from '@/store';
import { PageHeader, Card, SectionTitle, Alert } from '@/components/ui';
import PriorityBadge from '@/components/PriorityBadge';
import WhyButton from '@/components/WhyButton';

export default function CompetingEmergenciesPage() {
  const { emergencies, resources } = useStore();

  // Three competing emergencies
  const competing = ['E-101', 'E-102', 'E-103']
    .map((id) => emergencies.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const availableTeams = resources.filter(
    (r) => r.kind === 'rescue_vehicle' && (r.status === 'available' || r.status === 'assigned'),
  );

  // Priority-based assignment (not first-come-first-served)
  const sorted = [...competing].sort((a, b) => {
    const score = (e: typeof a) =>
      (e.priority === 'critical' ? 4 : e.priority === 'high' ? 3 : 2) +
      (e.injured ? 2 : 0) +
      (e.vulnerable ? 1 : 0) +
      (e.peopleAffected >= 10 ? 2 : e.peopleAffected >= 5 ? 1 : 0);
    return score(b) - score(a);
  });

  const assignments = sorted.slice(0, availableTeams.length).map((e, i) => ({
    emergency: e,
    team: availableTeams[i],
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <PageHeader
        title="Competing Emergencies"
        subtitle="Assignment is based on priority and resource constraints — not first-come-first-served"
        icon={<AlertTriangle className="h-6 w-6" />}
      />

      <Alert variant="warning" className="mb-4">
        <p className="text-sm">
          Three emergencies have arrived, but only <strong>{availableTeams.length} rescue teams</strong> are available.
          The system generates a response plan using severity, medical urgency, vulnerability, people affected, and resource availability.
        </p>
      </Alert>

      {/* Emergency cards */}
      <SectionTitle className="mb-3">Incoming Emergencies</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        {competing.map((e) => (
          <Card key={e.id}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-900">{e.id}</span>
              <PriorityBadge priority={e.priority} size="sm" />
            </div>
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {e.peopleAffected} people</div>
              {e.injured && <div className="flex items-center gap-1.5 text-red-600"><Heart className="h-3.5 w-3.5" /> Medical emergency</div>}
              {e.vulnerable && <div className="flex items-center gap-1.5 text-orange-600"><Accessibility className="h-3.5 w-3.5" /> Vulnerable person</div>}
              <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {e.location}</div>
              <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {Math.round((Date.now() - e.createdAt) / 60000)} min ago</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Response plan */}
      <SectionTitle className="mb-3">AI-Assisted Response Plan</SectionTitle>
      <Card>
        <p className="mb-3 text-sm text-gray-600">
          Response plan generated using priority and resource constraints.
        </p>
        <div className="space-y-3">
          {assignments.map(({ emergency, team }) => (
            <div key={emergency.id} className="rounded-lg border border-gray-100 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-gray-900">{team?.name ?? 'Unassigned'} → {emergency.id}</span>
                <PriorityBadge priority={emergency.priority} size="sm" />
              </div>
              <div className="text-xs text-gray-500 mb-1">Assigned to: {emergency.location}</div>
              <WhyButton
                reasons={[
                  `Priority: ${emergency.priority.toUpperCase()}`,
                  emergency.injured ? 'Medical urgency — injured person' : 'No medical urgency',
                  emergency.vulnerable ? 'Vulnerable person present' : 'No vulnerable persons',
                  `${emergency.peopleAffected} people affected`,
                  `Waiting time: ${Math.round((Date.now() - emergency.createdAt) / 60000)} min`,
                  team?.status === 'available' ? 'Resource currently available' : 'Resource already assigned',
                ].filter(Boolean)}
                label="Why this assignment?"
              />
            </div>
          ))}
          {sorted.length > availableTeams.length && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-orange-800">
                <AlertTriangle className="h-4 w-4" />
                {sorted[availableTeams.length].id} queued — no available resources
              </div>
              <p className="mt-1 text-xs text-orange-700">
                This emergency will be assigned as soon as a rescue team becomes available. ETA for next resource: ~15 min.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
