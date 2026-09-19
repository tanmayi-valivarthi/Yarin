import { Link } from 'react-router-dom';
import { HardHat, MapPin, Clock, Phone, MessageSquare, Check, Navigation, Flag, AlertTriangle, Truck } from 'lucide-react';
import { useStore } from '@/store';
import { PageHeader, Card, SectionTitle, Alert, Button } from '@/components/ui';
import PriorityBadge from '@/components/PriorityBadge';
import StatusTimeline from '@/components/StatusTimeline';
import WhyButton from '@/components/WhyButton';
import MapView from '@/components/MapView';

export default function RescuePage() {
  const { emergencies, resources, roads, shelters, hospitals, hazardZones, updateEmergencyStatus, addMessage } = useStore();

  // Rescue team's active mission
  const mission = emergencies.find((e) => e.id === 'E-102') ?? emergencies[0];
  const blockedRoad = roads.find((r) => r.blocked);
  const reassigned = mission?.assignedResource === 'R-04';

  const handleStatus = (status: typeof mission.status, text: string) => {
    if (mission) updateEmergencyStatus(mission.id, status, text);
  };

  if (!mission) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <PageHeader title="Rescue Team" />
        <Alert variant="info">No active missions assigned to your team.</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <PageHeader
        title="Rescue Team Interface"
        subtitle="Your active mission"
        icon={<HardHat className="h-6 w-6" />}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Left: mission details + map */}
        <div className="space-y-4">
          {/* Mission updated alert */}
          {reassigned && blockedRoad && (
            <Alert variant="warning" title="MISSION UPDATED">
              Previous route (Road R12) is blocked. New route calculated.
              <div className="mt-1 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" /> New ETA: <strong>{mission.eta} minutes</strong>
              </div>
              <p className="mt-1 text-xs">Reason: Road R12 became inaccessible.</p>
            </Alert>
          )}

          <Card>
            <div className="flex items-center justify-between">
              <SectionTitle>Active Mission</SectionTitle>
              <PriorityBadge priority={mission.priority} size="lg" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Info icon={<Users2 />} label="People trapped" value={`${mission.peopleAffected}`} />
              <Info icon={<HardHat />} label="Injured" value={mission.injured ? 'Yes' : 'No'} />
              <Info icon={<MapPin />} label="Location" value={mission.location} />
              <Info icon={<Truck />} label="Assigned resource" value={mission.assignedResource ?? 'Pending'} />
              <Info icon={<Clock />} label="ETA" value={mission.eta ? `${mission.eta} min` : '—'} />
              <Info icon={<Flag />} label="Vulnerable" value={mission.vulnerable ? 'Yes' : 'No'} />
            </div>
            <p className="mt-3 text-sm text-gray-600">{mission.description}</p>
            <div className="mt-3">
              <StatusTimeline current={mission.status} />
            </div>
          </Card>

          <Card>
            <SectionTitle className="mb-2">Route</SectionTitle>
            <MapView
              emergencies={[mission]}
              resources={resources.filter((r) => r.id === mission.assignedResource || r.kind === 'rescue_vehicle')}
              roads={roads}
              shelters={shelters}
              hospitals={hospitals}
              hazardZones={hazardZones}
              height="280px"
              focus={mission.coords}
            />
          </Card>
        </div>

        {/* Right: actions */}
        <div className="space-y-4">
          <Card>
            <SectionTitle className="mb-3">Mission Actions</SectionTitle>
            <div className="space-y-2">
              <Button variant="success" className="w-full" onClick={() => handleStatus('en_route', 'Mission accepted. Team en route.')}>
                <Check className="h-4 w-4" /> Accept Mission
              </Button>
              <Button variant="primary" className="w-full" onClick={() => handleStatus('en_route', 'Response started.')}>
                <Navigation className="h-4 w-4" /> Start Response
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => addMessage({
                id: `MSG-${Date.now()}`,
                time: Date.now(),
                from: 'Rescue Team R-02',
                to: 'Authority',
                text: 'Requesting update on E-102 route.',
                emergencyId: mission.id,
              })}>
                <Phone className="h-4 w-4" /> Call / Message
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => handleStatus('arrived', 'Team arrived at location.')}>
                <MapPin className="h-4 w-4" /> Arrived
              </Button>
              <Button variant="danger" className="w-full" onClick={() => handleStatus('resolved', 'Mission completed. All people rescued.')}>
                <Flag className="h-4 w-4" /> Complete
              </Button>
            </div>
          </Card>

          <Card>
            <SectionTitle className="mb-2">AI-Assisted Info</SectionTitle>
            <WhyButton reasons={mission.aiReasons} label="Why this mission priority?" />
          </Card>

          <Link to="/messages">
            <Button variant="ghost" className="w-full">
              <MessageSquare className="h-4 w-4" /> Mission Messages
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-gray-400">
        {icon}
        {label}
      </div>
      <div className="font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function Users2() {
  return <HardHat className="h-3 w-3" />;
}
