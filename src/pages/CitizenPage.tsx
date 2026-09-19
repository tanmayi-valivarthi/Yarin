import { Link } from 'react-router-dom';
import { Siren, MapPin, Heart, Search, UserSearch, FileText } from 'lucide-react';
import { useStore } from '@/store';
import { PageHeader, Card, SectionTitle } from '@/components/ui';
import SOSButton from '@/components/SOSButton';
import PriorityBadge from '@/components/PriorityBadge';
import StatusTimeline from '@/components/StatusTimeline';

export default function CitizenPage() {
  const { emergencies, online, pendingReports } = useStore();
  // Show citizen-submitted emergencies (in mock, show the first few)
  const myEmergencies = emergencies.slice(0, 3);

  const actions = [
    { to: '/emergency/report', icon: FileText, label: 'Report Emergency', desc: 'File a detailed report', color: 'bg-red-50 text-red-600' },
    { to: '/map', icon: MapPin, label: 'Find Shelter', desc: 'Locate nearby shelters', color: 'bg-purple-50 text-purple-600' },
    { to: '/response', icon: Heart, label: 'Find Medical Help', desc: 'Get medical assistance', color: 'bg-blue-50 text-blue-600' },
    { to: '/emergency/track', icon: Search, label: 'Track My Request', desc: 'Check emergency status', color: 'bg-gray-50 text-gray-600' },
    { to: '/missing/report', icon: UserSearch, label: 'Report Missing Person', desc: 'Report someone missing', color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <PageHeader title="Citizen Portal" subtitle="Report emergencies and get help" />

      {/* Offline notice */}
      {!online && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          You are offline. Emergency reports will be saved locally and synchronized when connectivity returns.
          {pendingReports > 0 && <span className="block mt-1 font-semibold">{pendingReports} report(s) saved locally.</span>}
        </div>
      )}

      {/* SOS signal section */}
      <div className="mb-6 flex flex-col items-center gap-3 rounded-xl bg-gradient-to-br from-red-600 to-red-700 p-6 text-center text-white">
        <Siren className="h-10 w-10" />
        <div>
          <div className="text-lg font-bold">In immediate danger?</div>
          <div className="text-sm text-red-100">Tap SOS to send a quick distress signal with your location</div>
        </div>
        <SOSButton large />
      </div>

      {/* Action grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((a) => (
          <Link key={a.to} to={a.to}>
            <Card className="h-full">
              <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${a.color}`}>
                <a.icon className="h-5 w-5" />
              </div>
              <div className="text-sm font-semibold text-gray-900">{a.label}</div>
              <div className="text-xs text-gray-500">{a.desc}</div>
            </Card>
          </Link>
        ))}
      </div>

      {/* My requests */}
      <div className="mt-8">
        <SectionTitle className="mb-3">My Emergency Requests</SectionTitle>
        <div className="space-y-2">
          {myEmergencies.map((e) => (
            <Card key={e.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{e.id}</span>
                    <PriorityBadge priority={e.priority} size="sm" />
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{e.description}</p>
                  <div className="mt-2">
                    <StatusTimeline current={e.status} compact />
                  </div>
                  {e.assignedTeam && (
                    <p className="mt-1.5 text-xs text-gray-500">
                      Assigned: {e.assignedTeam}
                      {e.eta ? ` · ETA ${e.eta} min` : ''}
                    </p>
                  )}
                </div>
                <Link to="/emergency/track" className="shrink-0">
                  <span className="text-xs font-medium text-blue-600 hover:underline">Track →</span>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
