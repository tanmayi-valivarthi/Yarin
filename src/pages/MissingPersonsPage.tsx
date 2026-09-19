import { useState } from 'react';
import { UserSearch, Plus, Check, AlertTriangle, Eye, EyeOff, Shield } from 'lucide-react';
import { useStore } from '@/store';
import { PageHeader, Card, SectionTitle, Alert, Button } from '@/components/ui';
import type { MissingPerson } from '@/types';

export default function MissingPersonsPage() {
  const { missingPersons, foundPersons, addMissingPerson, markPotentialMatch, confirmMatch, role } = useStore();
  const [showReport, setShowReport] = useState(false);
  const [revealIds, setRevealIds] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    name: '', age: '', gender: 'male' as 'male' | 'female' | 'other',
    lastLocation: '', description: '', contact: '',
  });

  const isAuthority = role === 'authority' || role === 'relief';

  const handleSubmit = () => {
    const p: MissingPerson = {
      id: `MP-${Math.floor(Math.random() * 900) + 100}`,
      name: form.name || 'Unknown',
      age: parseInt(form.age) || 0,
      gender: form.gender,
      lastLocation: form.lastLocation,
      description: form.description,
      contact: form.contact,
      status: 'missing',
      reportedAt: Date.now(),
    };
    addMissingPerson(p);
    setShowReport(false);
    setForm({ name: '', age: '', gender: 'male', lastLocation: '', description: '', contact: '' });
  };

  const toggleReveal = (id: string) => {
    setRevealIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <PageHeader
        title="Missing Persons"
        subtitle="Privacy-conscious reunification workflow"
        icon={<UserSearch className="h-6 w-6" />}
        action={
          isAuthority && (
            <Button variant="primary" onClick={() => setShowReport((s) => !s)}>
              <Plus className="h-4 w-4" /> Report Missing
            </Button>
          )
        }
      />

      <Alert variant="info" className="mb-4">
        <div className="flex items-center gap-1.5 text-xs">
          <Shield className="h-4 w-4" />
          Sensitive personal information is hidden by default. Authorized personnel can verify and reveal details for matching.
        </div>
      </Alert>

      {/* Report form */}
      {showReport && (
        <Card className="mb-4">
          <SectionTitle className="mb-3">Register Missing Person</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Input label="Approximate age" value={form.age} onChange={(v) => setForm({ ...form, age: v })} type="number" />
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as 'male' | 'female' | 'other' })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Input label="Last known location" value={form.lastLocation} onChange={(v) => setForm({ ...form, lastLocation: v })} />
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">Clothing / identifying information</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <Input label="Contact information" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} />
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="primary" size="sm" onClick={handleSubmit}>Submit Report</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowReport(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Potential matches */}
      {missingPersons.some((p) => p.status === 'potential_match') && (
        <Alert variant="warning" title="POTENTIAL MATCH" className="mb-4">
          {missingPersons.filter((p) => p.status === 'potential_match').map((p) => (
            <div key={p.id} className="text-sm">
              <strong>{p.id}</strong> — Possible match found at <strong>{p.possibleMatchAt}</strong>.
              <div className="mt-1 text-xs text-gray-600">
                Match based on: {p.matchReasons?.join(', ')}
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-xs font-bold text-orange-700">POTENTIAL MATCH — REQUIRES HUMAN VERIFICATION</span>
                {isAuthority && (
                  <Button size="sm" variant="success" onClick={() => confirmMatch(p.id)}>
                    <Check className="h-3 w-3" /> Confirm Match
                  </Button>
                )}
              </div>
            </div>
          ))}
        </Alert>
      )}

      {/* Missing persons list */}
      <SectionTitle className="mb-3">Missing Reports</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {missingPersons.map((p) => {
          const revealed = revealIds.has(p.id);
          return (
            <Card key={p.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{p.id}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      p.status === 'found' ? 'bg-green-100 text-green-700' :
                      p.status === 'potential_match' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {p.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                {isAuthority && (
                  <button onClick={() => toggleReveal(p.id)} className="text-gray-400 hover:text-gray-600">
                    {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium">{revealed ? p.name : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Age</span>
                  <span>{p.age || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last location</span>
                  <span>{p.lastLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Description</span>
                  <span className="text-right text-xs">{revealed ? p.description : 'Hidden — verify to reveal'}</span>
                </div>
              </div>
              {isAuthority && p.status === 'missing' && (
                <div className="mt-2">
                  <Button size="sm" variant="secondary" onClick={() => markPotentialMatch(p.id, 'Shelter B', ['Approximate age', 'Reported location', 'Descriptive information'])}>
                    <AlertTriangle className="h-3 w-3" /> Mark Potential Match
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Found persons */}
      {foundPersons.length > 0 && (
        <>
          <SectionTitle className="mb-3 mt-6">Found Persons (for matching)</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {foundPersons.map((f) => (
              <Card key={f.id}>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{f.id}</span>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">FOUND</span>
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Found at</span><span>{f.foundAt}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Approx. age</span><span>{f.approxAge}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Description</span><span className="text-xs text-right">{f.description}</span></div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}
