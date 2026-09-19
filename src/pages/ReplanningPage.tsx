import { useState } from 'react';
import { Activity, ArrowRight, Route, Truck, Clock, AlertTriangle, Check, RotateCcw, Zap } from 'lucide-react';
import { useStore } from '@/store';
import { PageHeader, Card, SectionTitle, Alert, Button } from '@/components/ui';
import PriorityBadge from '@/components/PriorityBadge';
import MapView from '@/components/MapView';

type Phase = 'initial' | 'changed' | 'replanned';

export default function ReplanningPage() {
  const { emergencies, resources, roads, shelters, hospitals, hazardZones, simulateRoadBlock, resetSimulation } = useStore();
  const [phase, setPhase] = useState<Phase>('initial');

  const mission = emergencies.find((e) => e.id === 'E-102');
  const blockedRoad = roads.find((r) => r.id === 'R12');
  const r01 = resources.find((r) => r.id === 'R-01');
  const r04 = resources.find((r) => r.id === 'R-04');

  const handleSimulate = () => {
    simulateRoadBlock();
    setPhase('changed');
    setTimeout(() => setPhase('replanned'), 1200);
  };

  const handleReset = () => {
    resetSimulation();
    setPhase('initial');
  };

  if (!mission) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <PageHeader title="Dynamic Replanning" />
        <Alert variant="info">No active mission E-102 found. Reset the simulation to try again.</Alert>
        <Button variant="secondary" onClick={handleReset} className="mt-3"><RotateCcw className="h-4 w-4" /> Reset</Button>
      </div>
    );
  }

  const isReplanned = mission.assignedResource === 'R-04';

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <PageHeader
        title="Dynamic Replanning Demo"
        subtitle="When conditions change, RESQNET recalculates and adapts the response"
        icon={<Activity className="h-6 w-6" />}
      />

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-2 text-xs">
        <Step active={phase === 'initial'} done={phase !== 'initial'} label="Initial Plan" />
        <div className={`h-0.5 w-6 ${phase !== 'initial' ? 'bg-blue-500' : 'bg-gray-200'}`} />
        <Step active={phase === 'changed'} done={phase === 'replanned'} label="Situation Changed" />
        <div className={`h-0.5 w-6 ${phase === 'replanned' ? 'bg-blue-500' : 'bg-gray-200'}`} />
        <Step active={phase === 'replanned'} done={phase === 'replanned'} label="New Plan" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Before */}
        <Card>
          <SectionTitle className="mb-3">BEFORE — Initial Plan</SectionTitle>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-cyan-600" />
              <span className="font-medium">Rescue Vehicle R-01</span>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">Road R12</span>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">Emergency E-102</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>ETA: <strong>6 minutes</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={mission.priority} size="sm" />
              <span className="text-gray-500">6 people trapped, 1 injured, 1 vulnerable</span>
            </div>
          </div>
        </Card>

        {/* After */}
        <Card className={isReplanned ? 'border-blue-300 ring-1 ring-blue-200' : ''}>
          <SectionTitle className="mb-3">AFTER — Updated Plan</SectionTitle>
          {isReplanned ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-cyan-600" />
                <span className="font-medium">Rescue Vehicle R-04</span>
                <ArrowRight className="h-3 w-3 text-gray-400" />
                <span className="text-gray-600">Alternate Route</span>
                <ArrowRight className="h-3 w-3 text-gray-400" />
                <span className="text-gray-600">Emergency E-102</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>ETA: <strong>11 minutes</strong></span>
              </div>
              <Alert variant="warning" className="mt-2">
                <p className="text-xs">Reason: Original route (Road R12) became inaccessible.</p>
              </Alert>
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center text-sm text-gray-300">
              Run the simulation to see the updated plan…
            </div>
          )}
        </Card>
      </div>

      {/* Simulation control */}
      <Card className="mt-4">
        <SectionTitle className="mb-3">Simulation Control</SectionTitle>
        {phase === 'initial' && (
          <>
            <p className="text-sm text-gray-600 mb-3">
              Click below to simulate Road R12 becoming blocked. The system will detect the change,
              identify the affected mission, recalculate the route, check available resources,
              and generate a new response plan.
            </p>
            <Button variant="danger" onClick={handleSimulate}>
              <Route className="h-4 w-4" /> Simulate Road Block
            </Button>
          </>
        )}
        {phase === 'changed' && (
          <Alert variant="critical" title="SITUATION CHANGED">
            <p className="text-sm">Road R12 is no longer accessible. The system is recalculating…</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <RotateCcw className="h-3.5 w-3.5 animate-spin" /> Identifying affected mission · Recalculating route · Checking resources…
            </div>
          </Alert>
        )}
        {phase === 'replanned' && (
          <>
            <Alert variant="success" title="NEW RESPONSE PLAN GENERATED">
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-600" /> Situation updated: Road R12 blocked</div>
                <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-600" /> Affected mission identified: E-102</div>
                <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-600" /> Route recalculated via alternate road</div>
                <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-600" /> Resource R-04 assigned (R-01 unavailable)</div>
                <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-600" /> New ETA: 11 minutes</div>
                <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-600" /> Rescue team notified of route change</div>
              </div>
            </Alert>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" /> Reset & Run Again
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Map */}
      <Card className="mt-4">
        <SectionTitle className="mb-2">Live Map</SectionTitle>
        <MapView
          emergencies={[mission]}
          resources={resources.filter((r) => r.kind === 'rescue_vehicle')}
          roads={roads}
          shelters={shelters}
          hospitals={hospitals}
          hazardZones={hazardZones}
          height="320px"
          focus={mission.coords}
        />
      </Card>

      {/* Information conflict demo */}
      <Card className="mt-4">
        <SectionTitle className="mb-2">Information Conflict</SectionTitle>
        <Alert variant="warning" title="CONFLICTING REPORTS">
          <div className="text-sm space-y-1">
            <div><strong>Citizen report:</strong> "Road R12 is blocked."</div>
            <div><strong>Responder report:</strong> "Road R12 is partially accessible."</div>
            <div className="mt-1 text-xs text-gray-600">Status: Needs verification — sources disagree about Road R12.</div>
          </div>
        </Alert>
      </Card>
    </div>
  );
}

function Step({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
        done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
      }`}>
        {done ? <Check className="h-3 w-3" /> : active ? '!' : '•'}
      </div>
      <span className={active || done ? 'text-gray-700 font-medium' : 'text-gray-400'}>{label}</span>
    </div>
  );
}
