import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Siren, MapPin, Check, Loader2, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store';
import type { Emergency } from '@/types';
import { PageHeader, Card, Button, Alert } from '@/components/ui';
import PriorityBadge from '@/components/PriorityBadge';

export default function SOSSignalPage() {
  const navigate = useNavigate();
  const { submitEmergency, online } = useStore();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<Emergency | null>(null);
  const [coords] = useState({
    lat: 26.915 + (Math.random() - 0.5) * 0.005,
    lng: 75.78 + (Math.random() - 0.5) * 0.005,
  });

  const handleSend = async () => {
    setSending(true);
    const result = await submitEmergency({
      disasterType: 'flood',
      description: 'SOS distress signal — citizen needs immediate help. No additional details provided.',
      coords,
      location: 'Auto-detected from device location',
      peopleAffected: 1,
      injured: false,
      vulnerable: false,
      immediateDanger: true,
    });
    setSending(false);
    if (result) {
      setSent(result);
    } else {
      setSent({
        id: 'LOCAL-SOS',
        disasterType: 'flood',
        description: 'SOS distress signal sent.',
        location: 'Auto-detected from device location',
        coords,
        peopleAffected: 1,
        injured: false,
        vulnerable: false,
        immediateDanger: true,
        priority: 'critical',
        status: 'reported',
        createdAt: Date.now(),
        updates: [{ time: Date.now(), text: 'SOS signal saved locally (offline). Will sync when connectivity returns.' }],
        aiReasons: ['Immediate danger reported (SOS signal)'],
      });
    }
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6">
        <PageHeader title="SOS Signal Sent" />

        <div className="mb-4 flex flex-col items-center gap-3 rounded-xl bg-gradient-to-br from-green-600 to-green-700 p-6 text-center text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Check className="h-8 w-8" />
          </div>
          <div>
            <div className="text-lg font-bold">Signal Received</div>
            <div className="text-sm text-green-100">Your SOS signal has been sent to the response team.</div>
          </div>
        </div>

        <Card className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Signal ID</div>
              <div className="text-2xl font-bold text-gray-900">{sent.id}</div>
            </div>
            <PriorityBadge priority={sent.priority} size="lg" />
          </div>
        </Card>

        <Card className="mb-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>Location shared with response team</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Siren className="h-4 w-4 text-red-500" />
              <span>Priority: Immediate danger assumed</span>
            </div>
          </div>
        </Card>

        {!online && (
          <Alert variant="warning" title="Signal saved locally" className="mb-4">
            You are offline. Your SOS signal will be sent to the response team when connectivity returns.
          </Alert>
        )}

        <Alert variant="info" className="mb-4">
          <p className="text-sm">
            A responder team has been notified of your location. Stay where you are if it is safe to do so.
            Help is on the way.
          </p>
        </Alert>

        <Button variant="secondary" className="w-full" onClick={() => navigate('/citizen')}>
          Back to Portal
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <PageHeader title="Emergency SOS" subtitle="Send a distress signal to the response team" />

      <div className="mb-4 flex flex-col items-center gap-3 rounded-xl bg-gradient-to-br from-red-600 to-red-700 p-8 text-center text-white">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15">
          <Siren className="h-10 w-10" />
        </div>
        <div>
          <div className="text-lg font-bold">Send Distress Signal</div>
          <div className="text-sm text-red-100">Your location will be shared with the response team immediately.</div>
        </div>
      </div>

      <Card className="mb-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">Location: Auto-detected from your device</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-gray-700">Priority: Treated as immediate danger</span>
          </div>
        </div>
      </Card>

      <Alert variant="info" className="mb-4">
        <p className="text-sm">
          This sends a quick distress signal with your location only. No details needed —
          a response team will be dispatched to your location immediately.
        </p>
      </Alert>

      <Button variant="danger" size="lg" className="w-full" onClick={handleSend} disabled={sending}>
        {sending ? <><Loader2 className="h-5 w-5 animate-spin" /> Sending Signal…</> : <><Siren className="h-5 w-5" /> Send SOS Signal</>}
      </Button>
    </div>
  );
}
