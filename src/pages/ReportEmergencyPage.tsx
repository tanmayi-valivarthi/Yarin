import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Users, Heart, Accessibility, AlertTriangle, Camera, Check, FileText, ChevronDown } from 'lucide-react';
import { useStore } from '@/store';
import type { DisasterType, Emergency, Priority } from '@/types';
import { PageHeader, Card, Button, Alert } from '@/components/ui';
import PriorityBadge from '@/components/PriorityBadge';
import WhyButton from '@/components/WhyButton';

const disasterOptions: { id: DisasterType; label: string }[] = [
  { id: 'flood', label: 'Flood' },
  { id: 'cyclone', label: 'Cyclone' },
  { id: 'earthquake', label: 'Earthquake' },
  { id: 'landslide', label: 'Landslide' },
  { id: 'forest_fire', label: 'Forest Fire' },
];

const peopleOptions = ['1', '2', '3', '4', '5', '6-10', '10+'];
const severityOptions = [
  { value: 'high', label: 'High — life-threatening' },
  { value: 'medium', label: 'Medium — urgent but stable' },
  { value: 'low', label: 'Low — need assistance' },
];

function Dropdown({
  label,
  icon: Icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        <Icon className="mr-1 inline h-4 w-4" /> {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 pr-9 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <Icon className="h-4 w-4 text-gray-400" />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

export default function ReportEmergencyPage() {
  const navigate = useNavigate();
  const { submitEmergency, online } = useStore();
  const [submitted, setSubmitted] = useState<Emergency | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    disasterType: 'flood' as DisasterType,
    severity: 'high',
    location: 'Zone A, Riverside Area',
    people: '6',
    injured: true,
    vulnerable: true,
    immediateDanger: true,
    description: '',
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const triage = (): { priority: Priority; reasons: string[] } => {
    const reasons: string[] = [];
    const peopleRaw = form.people;
    const people = peopleRaw === '10+' ? 15 : parseInt(peopleRaw) || 1;
    if (form.immediateDanger) reasons.push('Immediate danger reported');
    if (form.injured) reasons.push('Medical emergency (injured person)');
    if (form.vulnerable) reasons.push('Vulnerable person present');
    if (people >= 4) reasons.push(`Multiple people affected (${form.people})`);

    const score =
      (form.immediateDanger ? 4 : 0) +
      (form.injured ? 3 : 0) +
      (form.vulnerable ? 2 : 0) +
      (people >= 10 ? 3 : people >= 4 ? 2 : 1);

    const priority: Priority = score >= 7 ? 'critical' : score >= 5 ? 'high' : score >= 3 ? 'medium' : 'low';
    return { priority, reasons };
  };

  const parsePeople = (val: string): number => {
    if (val === '10+') return 15;
    if (val.includes('-')) {
      const parts = val.split('-');
      return parseInt(parts[0]) || 1;
    }
    return parseInt(val) || 1;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const { priority, reasons } = triage();
    const coords = { lat: 26.915 + (Math.random() - 0.5) * 0.005, lng: 75.78 + (Math.random() - 0.5) * 0.005 };
    const desc = form.description.trim() || 'No additional description provided.';
    const result = await submitEmergency({
      disasterType: form.disasterType,
      description: desc,
      coords,
      location: form.location,
      peopleAffected: parsePeople(form.people),
      injured: form.injured,
      vulnerable: form.vulnerable,
      immediateDanger: form.immediateDanger,
    });
    setSubmitting(false);
    if (result) {
      const finalEmergency: Emergency = {
        ...result,
        priority: result.priority || priority,
        aiReasons: result.aiReasons?.length ? result.aiReasons : reasons,
      };
      setSubmitted(finalEmergency);
    } else {
      setSubmitted({
        id: 'ERROR',
        disasterType: form.disasterType,
        description: desc,
        location: form.location,
        coords,
        peopleAffected: parsePeople(form.people),
        injured: form.injured,
        vulnerable: form.vulnerable,
        immediateDanger: form.immediateDanger,
        priority,
        status: 'reported',
        createdAt: Date.now(),
        updates: [{ time: Date.now(), text: 'Unable to connect to response server. Your emergency report has been saved locally and will sync when connectivity returns.' }],
        aiReasons: reasons,
      });
    }
  };

  if (submitted) {
    const { priority } = triage();
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <PageHeader title="Emergency Reported" />
        {!online && (
          <Alert variant="warning" title="Report saved locally" className="mb-4">
            You are offline. This report will be synchronized when connectivity returns.
          </Alert>
        )}
        <Card className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Emergency ID</div>
              <div className="text-2xl font-bold text-gray-900">{submitted.id}</div>
            </div>
            <PriorityBadge priority={priority} size="lg" />
          </div>
        </Card>

        <Card className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">AI-Assisted Triage</h3>
            <span className="text-[10px] font-medium text-gray-400">RECOMMENDATION</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-500">People affected:</span> <strong>{submitted.peopleAffected}</strong></div>
            <div><span className="text-gray-500">Medical urgency:</span> <strong>{submitted.injured ? 'High' : 'Low'}</strong></div>
            <div><span className="text-gray-500">Vulnerable person:</span> <strong>{submitted.vulnerable ? 'Yes' : 'No'}</strong></div>
            <div><span className="text-gray-500">Immediate danger:</span> <strong>{submitted.immediateDanger ? 'Yes' : 'No'}</strong></div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-500">Priority:</span>
            <PriorityBadge priority={priority} />
          </div>
          <WhyButton reasons={submitted.aiReasons} label="Why this priority?" />
        </Card>

        {submitted.description && submitted.description !== 'No additional description provided.' && (
          <Card className="mb-4">
            <h3 className="mb-1 text-sm font-bold text-gray-900">Additional Description</h3>
            <p className="text-sm text-gray-600">{submitted.description}</p>
          </Card>
        )}

        <Card className="mb-4">
          <h3 className="mb-2 text-sm font-bold text-gray-900">Status</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Location:</span> <span>{submitted.location}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status:</span> <span className="font-medium text-blue-600">Reported — awaiting triage</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Assigned team:</span> <span className="text-gray-400">Pending assignment</span></div>
          </div>
        </Card>

        <div className="flex gap-2">
          <Button variant="primary" onClick={() => navigate('/emergency/track')}>Track My Request</Button>
          <Button variant="secondary" onClick={() => navigate('/citizen')}>Back to Portal</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <PageHeader title="Report Emergency" subtitle="Select the relevant details from the dropdowns below" />

      <Card className="space-y-4">
        {/* Disaster type — dropdown */}
        <Dropdown
          label="Disaster Type"
          icon={AlertTriangle}
          value={form.disasterType}
          options={disasterOptions.map((d) => ({ value: d.id, label: d.label }))}
          onChange={(v) => set('disasterType', v)}
        />

        {/* Severity — dropdown */}
        <Dropdown
          label="Severity Level"
          icon={AlertTriangle}
          value={form.severity}
          options={severityOptions}
          onChange={(v) => set('severity', v)}
        />

        {/* Location — dropdown */}
        <Dropdown
          label="Your Location / Area"
          icon={MapPin}
          value={form.location}
          options={[
            { value: 'Zone A, Riverside Area', label: 'Zone A — Riverside Area' },
            { value: 'Zone B, Market Road', label: 'Zone B — Market Road' },
            { value: 'Zone C, Flood Plain', label: 'Zone C — Flood Plain' },
            { value: 'Zone D, Old Bridge', label: 'Zone D — Old Bridge' },
            { value: 'Zone E, Residential Colony', label: 'Zone E — Residential Colony' },
          ]}
          onChange={(v) => set('location', v)}
        />

        {/* Number of people — dropdown */}
        <Dropdown
          label="Number of People Affected"
          icon={Users}
          value={form.people}
          options={peopleOptions.map((p) => ({ value: p, label: p }))}
          onChange={(v) => set('people', v)}
        />

        {/* Toggles */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Situation Details</label>
          <ToggleRow
            icon={Heart}
            label="Are there injured people?"
            checked={form.injured}
            onChange={(v) => set('injured', v)}
          />
          <ToggleRow
            icon={Accessibility}
            label="Elderly / children / disabled / vulnerable?"
            checked={form.vulnerable}
            onChange={(v) => set('vulnerable', v)}
          />
          <ToggleRow
            icon={AlertTriangle}
            label="Is there immediate danger?"
            checked={form.immediateDanger}
            onChange={(v) => set('immediateDanger', v)}
          />
        </div>

        {/* Additional description — separate textarea, optional */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            <FileText className="mr-1 inline h-4 w-4" /> Additional Description
            <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Add any extra details about the situation…"
          />
        </div>

        {/* Photo */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Optional Photo</label>
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-3 text-sm text-gray-400">
            <Camera className="h-5 w-5" />
            <span>Tap to add a photo (optional)</span>
          </div>
        </div>

        <Button variant="danger" size="lg" className="w-full" onClick={handleSubmit} disabled={submitting}>
          {submitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting…</> : <><Check className="h-5 w-5" /> Submit Emergency Report</>}
        </Button>
      </Card>
    </div>
  );
}
