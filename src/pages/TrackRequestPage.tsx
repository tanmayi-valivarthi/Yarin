import { useState } from 'react';
import { useStore } from '@/store';
import { PageHeader, Card, SectionTitle, Alert } from '@/components/ui';
import PriorityBadge from '@/components/PriorityBadge';
import StatusTimeline from '@/components/StatusTimeline';
import WhyButton from '@/components/WhyButton';

export default function TrackRequestPage() {
  const { emergencies } = useStore();
  const [selectedId, setSelectedId] = useState(emergencies[0]?.id ?? '');
  const selected = emergencies.find((e) => e.id === selectedId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <PageHeader title="Track My Request" subtitle="Follow the status of your emergency report" />

      {emergencies.length === 0 && (
        <Alert variant="info">No emergency reports yet.</Alert>
      )}

      {emergencies.length > 0 && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {emergencies.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelectedId(e.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  e.id === selectedId
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {e.id}
              </button>
            ))}
          </div>

          {selected && (
            <div className="space-y-4">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Emergency ID</div>
                    <div className="text-xl font-bold text-gray-900">{selected.id}</div>
                  </div>
                  <PriorityBadge priority={selected.priority} size="lg" />
                </div>
                <p className="mt-3 text-sm text-gray-600">{selected.description}</p>
              </Card>

              <Card>
                <SectionTitle className="mb-3">Response Status</SectionTitle>
                <StatusTimeline current={selected.status} />
              </Card>

              <Card>
                <SectionTitle className="mb-3">Details</SectionTitle>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location</span>
                    <span className="font-medium">{selected.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="font-medium text-blue-600">{selected.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assigned team</span>
                    <span className="font-medium">{selected.assignedTeam ?? 'Pending'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estimated arrival</span>
                    <span className="font-medium">{selected.eta ? `${selected.eta} min` : 'Calculating…'}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <WhyButton reasons={selected.aiReasons} label="Why this priority?" />
                </div>
              </Card>

              <Card>
                <SectionTitle className="mb-3">Latest Updates</SectionTitle>
                <div className="space-y-2">
                  {[...selected.updates].reverse().map((u, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      <div>
                        <span className="text-gray-400 text-xs">
                          {new Date(u.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <p className="text-gray-700">{u.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
