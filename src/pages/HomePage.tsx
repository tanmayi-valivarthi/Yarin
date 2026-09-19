import { Link } from 'react-router-dom';
import { Shield, Siren, MapPin, Heart, ArrowRight, AlertTriangle, Waves, Activity } from 'lucide-react';
import { useStore } from '@/store';
import SOSButton from '@/components/SOSButton';
import { Alert, Button } from '@/components/ui';

export default function HomePage() {
  const { emergencies, role } = useStore();
  const critical = emergencies.filter((e) => e.priority === 'critical');
  const activeWarnings = [
    'Water level rising in Zone A',
    'Main road R12 partially blocked',
    'Shelter B approaching capacity',
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
          <Shield className="h-3.5 w-3.5" />
          DISASTER RESPONSE COORDINATION PORTAL
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          When Every Minute<br />
          <span className="text-red-600">Changes the Answer</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-gray-600 sm:text-lg">
          Intelligent disaster response that adapts as situations change.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <SOSButton large />
          <Link to="/map">
            <Button variant="secondary" size="lg">
              <MapPin className="h-5 w-5" /> Find Shelter
            </Button>
          </Link>
          <Link to="/response">
            <Button variant="secondary" size="lg">
              <Heart className="h-5 w-5" /> Medical Help
            </Button>
          </Link>
        </div>
      </div>

      {/* Current Situation */}
      <div className="mt-10">
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-bold text-gray-900">Current Situation</h2>
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
            Flood Emergency — Zone A
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Alert variant="critical" title="Active Warnings">
            <ul className="space-y-1.5">
              {activeWarnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                  {w}
                </li>
              ))}
            </ul>
          </Alert>
          <Alert variant="warning" title="Requires Attention">
            <p>
              {critical.length} critical {critical.length === 1 ? 'emergency' : 'emergencies'} require immediate response.
              Rescue teams have been dispatched to Zone A.
            </p>
            <Link to="/map" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline">
              View live map <ArrowRight className="h-3 w-3" />
            </Link>
          </Alert>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-10">
        <h2 className="mb-4 text-center text-lg font-bold text-gray-900">How RESQNET Works</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { icon: Siren, label: 'Citizen Reports', desc: 'Submit emergency with details', color: 'text-red-600 bg-red-50' },
            { icon: Activity, label: 'AI Triage', desc: 'Prioritizes & categorizes', color: 'text-orange-600 bg-orange-50' },
            { icon: Waves, label: 'System Allocates', desc: 'Assigns nearest resources', color: 'text-cyan-600 bg-cyan-50' },
            { icon: Shield, label: 'Responder Acts', desc: 'Adapts as situation changes', color: 'text-blue-600 bg-blue-50' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="text-sm font-semibold text-gray-900">{s.label}</div>
              <div className="mt-0.5 text-xs text-gray-500">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Role entry */}
      {!role && (
        <div className="mt-10 rounded-xl border border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-600">Select your role to access the coordination portal</p>
          <Link to="/role" className="mt-3 inline-block">
            <Button variant="primary" size="lg">
              Select Role <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
