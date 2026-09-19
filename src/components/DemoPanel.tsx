import { useState } from 'react';
import { Sliders, X, Play, RotateCcw, AlertTriangle, Route, Ban, Bed, Waves, Siren, Activity } from 'lucide-react';
import { useStore } from '@/store';
import { replanningService } from '@/services/replanningService';

export default function DemoPanel() {
  const [open, setOpen] = useState(false);
  const {
    role,
    simulateRoadBlock,
    simulateCompetingEmergencies,
    resetSimulation,
    expandHazard,
    setHospitalIncoming,
    addNotification,
    refreshAll,
  } = useStore();

  if (!role || role !== 'authority') return null;

  const actions = [
    {
      label: 'New Critical SOS',
      icon: Siren,
      color: 'text-red-600',
      action: async () => {
        try {
          await replanningService.newEmergency();
          await refreshAll();
        } catch { /* fallback handled by store */ }
      },
    },
    {
      label: 'Road R12 Blocked',
      icon: Route,
      color: 'text-red-600',
      action: simulateRoadBlock,
    },
    {
      label: 'Resource Unavailable',
      icon: Ban,
      color: 'text-orange-600',
      action: async () => {
        try {
          await replanningService.resourceUnavailable('R-03');
          await refreshAll();
        } catch { /* fallback */ }
      },
    },
    {
      label: 'Hospital Capacity Change',
      icon: Activity,
      color: 'text-blue-600',
      action: async () => {
        try {
          await replanningService.hospitalFull('H-02');
          await refreshAll();
        } catch { /* fallback */ }
      },
    },
    {
      label: 'Hazard Zone Expands',
      icon: Waves,
      color: 'text-cyan-600',
      action: async () => {
        try {
          await replanningService.expandHazard('HZ-A');
          await refreshAll();
        } catch { /* fallback */ }
      },
    },
    {
      label: 'Competing Emergencies',
      icon: AlertTriangle,
      color: 'text-orange-600',
      action: simulateCompetingEmergencies,
    },
  ];

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-[1300] flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-gray-800"
      >
        {open ? <X className="h-4 w-4" /> : <Sliders className="h-4 w-4" />}
        {open ? 'Close' : 'Demo Simulation'}
      </button>

      {open && (
        <div className="fixed bottom-16 right-5 z-[1300] w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-gray-900">Demo Simulation</div>
              <div className="text-[10px] text-gray-400">Trigger events to see adaptive response</div>
            </div>
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">DEMO</span>
          </div>
          <div className="space-y-1.5">
            {actions.map((a) => (
              <button
                key={a.label}
                onClick={() => {
                  a.action();
                }}
                className="flex w-full items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                <a.icon className={`h-4 w-4 ${a.color}`} />
                <span className="flex-1 text-gray-700">{a.label}</span>
                <Play className="h-3 w-3 text-gray-400" />
              </button>
            ))}
            <div className="!mt-3 border-t border-gray-100 pt-2">
              <button
                onClick={resetSimulation}
                className="flex w-full items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
