import { useState } from 'react';
import {
  Building2, BedDouble, HeartPulse, Activity, Ambulance, Droplets, Users,
  AlertTriangle, Check, X, Clock, MapPin, ChevronDown, Send, Stethoscope,
  Siren, Shield, Pill, User, Route as RouteIcon,
} from 'lucide-react';
import { useStore } from '@/store';
import type { HospitalStatus, BloodStatus, Priority } from '@/types';
import { PageHeader, Card, SectionTitle, Alert, Button } from '@/components/ui';
import PriorityBadge from '@/components/PriorityBadge';

const statusConfig: Record<HospitalStatus, { label: string; color: string; bg: string; dot: string }> = {
  operational: { label: 'OPERATIONAL', color: 'text-green-700', bg: 'bg-green-50 border-green-200', dot: 'bg-green-500' },
  limited: { label: 'LIMITED CAPACITY', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', dot: 'bg-yellow-500' },
  critical: { label: 'CRITICAL', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500' },
  closed: { label: 'TEMPORARILY UNAVAILABLE', color: 'text-red-700', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500' },
};

const bloodConfig: Record<BloodStatus, { label: string; color: string }> = {
  available: { label: 'Available', color: 'text-green-600' },
  low: { label: 'Low', color: 'text-yellow-600' },
  critical: { label: 'Critical', color: 'text-red-600' },
};

const requestResourceOptions = [
  'Blood', 'Oxygen', 'Medicines', 'Ambulance', 'Medical team',
  'Additional beds', 'Rescue support', 'Generator/fuel',
];

const urgencyOptions: Priority[] = ['critical', 'high', 'medium', 'low'];

export default function HospitalPage() {
  const { hospitals, updateHospital, toggleReceives, toggleTask, sendResourceRequest, addAccessibilityNote, setHospitalIncoming } = useStore();
  const hospital = hospitals.find((h) => h.id === 'H-01') ?? hospitals[0];

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [reqForm, setReqForm] = useState({ resource: 'Oxygen', quantity: 10, urgency: 'high' as Priority, reason: '' });
  const [accessNote, setAccessNote] = useState('');
  const [selectedSection, setSelectedSection] = useState('dashboard');

  if (!hospital) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <PageHeader title="Hospital" icon={<Building2 className="h-6 w-6" />} />
        <Alert variant="info">No hospital data available.</Alert>
      </div>
    );
  }

  const sc = statusConfig[hospital.status];
  const atCapacity = hospital.emergencyBeds === 0;

  const capacityBars = [
    { label: 'Emergency Beds', available: hospital.emergencyBeds, total: hospital.emergencyBedsTotal, icon: <BedDouble className="h-4 w-4" /> },
    { label: 'ICU', available: hospital.icu, total: hospital.icuTotal, icon: <HeartPulse className="h-4 w-4" /> },
    { label: 'Ventilators', available: hospital.ventilators, total: hospital.ventilatorsTotal, icon: <Activity className="h-4 w-4" /> },
    { label: 'Isolation Beds', available: hospital.isolationBeds, total: hospital.isolationBedsTotal, icon: <Shield className="h-4 w-4" /> },
  ];

  const receiveTypes: { key: 'receivesTrauma' | 'receivesMedical' | 'receivesBurns' | 'receivesPediatric' | 'receivesCritical'; label: string }[] = [
    { key: 'receivesTrauma', label: 'Trauma' },
    { key: 'receivesMedical', label: 'Medical emergencies' },
    { key: 'receivesBurns', label: 'Major burns' },
    { key: 'receivesPediatric', label: 'Pediatric' },
    { key: 'receivesCritical', label: 'Critical patients' },
  ];

  const bloodTypes: { key: 'bloodO' | 'bloodA' | 'bloodB' | 'bloodAB'; label: string }[] = [
    { key: 'bloodO', label: 'O+' },
    { key: 'bloodA', label: 'A+' },
    { key: 'bloodB', label: 'B+' },
    { key: 'bloodAB', label: 'AB+' },
  ];

  const adjustCapacity = (field: 'emergencyBeds' | 'icu' | 'ventilators' | 'isolationBeds', delta: number) => {
    const totalKey = `${field}Total` as keyof typeof hospital;
    const total = hospital[totalKey] as number;
    const current = hospital[field];
    const newVal = Math.max(0, Math.min(total, current + delta));
    updateHospital(hospital.id, { [field]: newVal });
  };

  const handleSendRequest = () => {
    sendResourceRequest(hospital.id, reqForm);
    setReqForm({ resource: 'Oxygen', quantity: 10, urgency: 'high', reason: '' });
  };

  const handleAddNote = () => {
    if (accessNote.trim()) {
      addAccessibilityNote(hospital.id, accessNote.trim());
      setAccessNote('');
    }
  };

  const toggleEntrance = (field: 'mainEntrance' | 'emergencyEntrance') => {
    const current = hospital.accessibility[field];
    updateHospital(hospital.id, {
      accessibility: {
        ...hospital.accessibility,
        [field]: current === 'accessible' ? 'blocked' : 'accessible',
      },
    });
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Building2 },
    { id: 'capacity', label: 'Capacity', icon: BedDouble },
    { id: 'resources', label: 'Resources', icon: Stethoscope },
    { id: 'ambulances', label: 'Ambulances', icon: Ambulance },
    { id: 'incoming', label: 'Incoming', icon: Users },
    { id: 'requests', label: 'Requests', icon: Send },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{hospital.name}</h1>
            <div className="text-xs text-gray-500">
              Logged in as: <span className="font-medium">Dr. Disaster Coordinator</span> · Hospital Administrator
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">Profile</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
        {/* Sidebar */}
        <div className="flex gap-1 overflow-x-auto lg:flex-col">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedSection(item.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                selectedSection === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="space-y-4">
          {atCapacity && (
            <Alert variant="critical" title="CAPACITY ALERT">
              Emergency department is full. New patients should be redirected to the nearest available hospital.
            </Alert>
          )}

          {/* SECTION 1: Hospital Status */}
          <Card>
            <div className="flex items-center justify-between">
              <SectionTitle>Hospital Status</SectionTitle>
              <div className={`flex items-center gap-2 rounded-lg border px-3 py-1 ${sc.bg}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${sc.dot} ${hospital.status === 'critical' ? 'animate-pulse' : ''}`} />
                <span className={`text-sm font-bold ${sc.color}`}>{sc.label}</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div className="flex items-center gap-2">
                {hospital.edOpen ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}
                <span className="text-gray-700">Emergency Dept: {hospital.edOpen ? 'OPEN' : 'CLOSED'}</span>
              </div>
              <div className="flex items-center gap-2">
                {hospital.ambulanceReceiving ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}
                <span className="text-gray-700">Ambulance Receiving: {hospital.ambulanceReceiving ? 'YES' : 'NO'}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${statusConfig[hospital.disasterCapacity].color}`} />
                <span className="text-gray-700">Disaster Capacity: <span className="font-medium">{statusConfig[hospital.disasterCapacity].label}</span></span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="h-3.5 w-3.5" /> Last updated: {new Date(hospital.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="mt-4">
              <div className="relative inline-block">
                <Button size="sm" variant="primary" onClick={() => setShowStatusDropdown((o) => !o)}>
                  Update Hospital Status <ChevronDown className="ml-1 h-3.5 w-3.5" />
                </Button>
                {showStatusDropdown && (
                  <div className="absolute left-0 top-10 z-20 w-56 rounded-lg border border-gray-200 bg-white shadow-xl">
                    {(['operational', 'limited', 'critical', 'closed'] as HospitalStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          updateHospital(hospital.id, { status: s, disasterCapacity: s });
                          setShowStatusDropdown(false);
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${hospital.status === s ? 'font-bold text-blue-600' : 'text-gray-700'}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${statusConfig[s].dot}`} />
                        {statusConfig[s].label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* SECTION 2: Capacity Management */}
          <Card>
            <SectionTitle className="mb-3">Capacity Management</SectionTitle>
            <div className="space-y-4">
              {capacityBars.map((c) => (
                <div key={c.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-gray-600">{c.icon} {c.label}</span>
                    <span className="font-semibold text-gray-800">{c.available} / {c.total}</span>
                  </div>
                  <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full transition-all ${c.available > c.total * 0.5 ? 'bg-green-500' : c.available > c.total * 0.2 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${c.total > 0 ? (c.available / c.total) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => adjustCapacity(c.label === 'Emergency Beds' ? 'emergencyBeds' : c.label === 'ICU' ? 'icu' : c.label === 'Ventilators' ? 'ventilators' : 'isolationBeds', -1)} className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50">
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{c.available}</span>
                    <button onClick={() => adjustCapacity(c.label === 'Emergency Beds' ? 'emergencyBeds' : c.label === 'ICU' ? 'icu' : c.label === 'Ventilators' ? 'ventilators' : 'isolationBeds', 1)} className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50">
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* SECTION 3: Ambulance & Receiving Capacity */}
          <Card>
            <SectionTitle className="mb-3">Ambulance & Receiving Capacity</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Hospital Ambulances</div>
                <div className="space-y-1.5">
                  {hospital.ambulances.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5">
                        <Ambulance className="h-4 w-4 text-gray-400" /> {a.id}
                      </span>
                      <span className={`flex items-center gap-1.5 font-medium ${
                        a.status === 'available' ? 'text-green-600' : a.status === 'on_mission' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        <span className={`h-2 w-2 rounded-full ${
                          a.status === 'available' ? 'bg-green-500' : a.status === 'on_mission' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        {a.status === 'available' ? 'Available' : a.status === 'on_mission' ? 'On Mission' : 'Returning'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  External ambulances incoming: <strong className="text-gray-900">{hospital.externalAmbulancesIncoming}</strong>
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Can Receive</div>
                <div className="space-y-1.5">
                  {receiveTypes.map((r) => (
                    <label key={r.key} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={hospital[r.key]}
                        onChange={() => toggleReceives(hospital.id, r.key)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={hospital[r.key] ? 'text-gray-700' : 'text-gray-400'}>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION 4: Medical Resources */}
          <Card>
            <SectionTitle className="mb-3">Medical Resource Availability</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="flex items-center gap-1.5 text-gray-600"><Stethoscope className="h-4 w-4" /> Doctors</span><strong>{hospital.doctors}</strong></div>
                <div className="flex justify-between"><span className="flex items-center gap-1.5 text-gray-600"><HeartPulse className="h-4 w-4" /> Emergency Specialists</span><strong>{hospital.emergencySpecialists}</strong></div>
                <div className="flex justify-between"><span className="flex items-center gap-1.5 text-gray-600"><User className="h-4 w-4" /> Nurses</span><strong>{hospital.nurses}</strong></div>
                <div className="flex items-center gap-2 pt-1">
                  <Droplets className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Oxygen:</span>
                  <span className={`font-medium ${bloodConfig[hospital.oxygen].color}`}>{bloodConfig[hospital.oxygen].label}</span>
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Blood Availability</div>
                <div className="grid grid-cols-2 gap-2">
                  {bloodTypes.map((b) => (
                    <div key={b.key} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm">
                      <span className="font-medium text-gray-700">{b.label}</span>
                      <span className={`font-medium ${bloodConfig[hospital[b.key]].color}`}>{bloodConfig[hospital[b.key]].label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION 5: Incoming Patient Load */}
          <Card>
            <SectionTitle className="mb-3">Incoming Patient / Disaster Load</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Current:</span><strong className="text-lg text-gray-900">{hospital.incoming}</strong></div>
                <div className="flex justify-between"><span className="text-gray-500">Expected next 30 min:</span><strong className="text-orange-600">{hospital.expectedNext30}</strong></div>
                <div className="flex justify-between"><span className="text-gray-500">Expected next 2 hrs:</span><strong className="text-red-600">{hospital.expectedNext2Hrs}</strong></div>
                <div className="mt-3 border-t border-gray-100 pt-2">
                  <div className="flex justify-between"><span className="flex items-center gap-1 text-red-600"><Siren className="h-3.5 w-3.5" /> Critical</span><strong>{hospital.incomingCritical}</strong></div>
                  <div className="flex justify-between"><span className="flex items-center gap-1 text-orange-600"><Activity className="h-3.5 w-3.5" /> Serious</span><strong>{hospital.incomingSerious}</strong></div>
                  <div className="flex justify-between"><span className="flex items-center gap-1 text-green-600"><Activity className="h-3.5 w-3.5" /> Moderate</span><strong>{hospital.incomingModerate}</strong></div>
                </div>
              </div>
              {hospital.aiWarning && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
                    <div>
                      <div className="text-sm font-semibold text-yellow-800">{hospital.aiWarning}</div>
                      <div className="mt-2 space-y-1 text-xs text-yellow-700">
                        {hospital.aiWarningReasons.map((r, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-yellow-600" /> {r}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setHospitalIncoming(hospital.id, hospital.incoming + 6)}>
                <Users className="h-3.5 w-3.5" /> Simulate surge
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setHospitalIncoming(hospital.id, 0)}>Reset</Button>
            </div>
          </Card>

          {/* SECTION 6: Resource Requests */}
          <Card>
            <SectionTitle className="mb-3">Requests & Communication</SectionTitle>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Send Request to Authority</div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <select
                        value={reqForm.resource}
                        onChange={(e) => setReqForm({ ...reqForm, resource: e.target.value })}
                        className="w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {requestResourceOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={reqForm.quantity}
                      onChange={(e) => setReqForm({ ...reqForm, quantity: parseInt(e.target.value) || 0 })}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Quantity"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={reqForm.urgency}
                      onChange={(e) => setReqForm({ ...reqForm, urgency: e.target.value as Priority })}
                      className="w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {urgencyOptions.map((u) => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                  <textarea
                    value={reqForm.reason}
                    onChange={(e) => setReqForm({ ...reqForm, reason: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Reason for request…"
                  />
                  <Button variant="primary" size="sm" className="w-full" onClick={handleSendRequest}>
                    <Send className="h-4 w-4" /> Send Request
                  </Button>
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Active Requests</div>
                <div className="space-y-2">
                  {hospital.resourceRequests.length === 0 && (
                    <div className="text-sm text-gray-400">No active requests</div>
                  )}
                  {hospital.resourceRequests.map((r) => (
                    <div key={r.id} className="rounded-lg border border-gray-100 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">{r.resource} ×{r.quantity}</span>
                        <PriorityBadge priority={r.urgency} size="sm" />
                      </div>
                      <div className="mt-1 text-xs text-gray-500">{r.reason}</div>
                      <div className="mt-1.5 flex items-center gap-2 text-xs">
                        <span className={`rounded px-1.5 py-0.5 font-medium ${
                          r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          r.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>{r.status}</span>
                        <span className="text-gray-400">{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION 7: Accessibility */}
          <Card>
            <SectionTitle className="mb-3">Hospital Accessibility</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <button
                  onClick={() => toggleEntrance('mainEntrance')}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 text-sm hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2">
                    <RouteIcon className="h-4 w-4 text-gray-400" /> Main Entrance
                  </span>
                  <span className={`flex items-center gap-1.5 font-medium ${
                    hospital.accessibility.mainEntrance === 'accessible' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${hospital.accessibility.mainEntrance === 'accessible' ? 'bg-green-500' : 'bg-red-500'}`} />
                    {hospital.accessibility.mainEntrance === 'accessible' ? 'Accessible' : 'Blocked'}
                  </span>
                </button>
                <button
                  onClick={() => toggleEntrance('emergencyEntrance')}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 text-sm hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2">
                    <Ambulance className="h-4 w-4 text-gray-400" /> Emergency Entrance
                  </span>
                  <span className={`flex items-center gap-1.5 font-medium ${
                    hospital.accessibility.emergencyEntrance === 'accessible' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${hospital.accessibility.emergencyEntrance === 'accessible' ? 'bg-green-500' : 'bg-red-500'}`} />
                    {hospital.accessibility.emergencyEntrance === 'accessible' ? 'Accessible' : 'Blocked'}
                  </span>
                </button>
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Access Notes</div>
                <div className="space-y-1.5">
                  {hospital.accessibility.notes.map((n, i) => (
                    <div key={i} className="flex items-start gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" /> {n}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    value={accessNote}
                    onChange={(e) => setAccessNote(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Report access issue…"
                  />
                  <Button size="sm" variant="secondary" onClick={handleAddNote}>Add</Button>
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION 8: Map placeholder */}
          <Card>
            <SectionTitle className="mb-3">Location & Map</SectionTitle>
            <div className="relative h-48 overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-green-50">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">{hospital.name}</span>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Nearby shelters</span>
                  <span className="flex items-center gap-1"><Siren className="h-3 w-3 text-red-500" /> Active emergencies</span>
                  <span className="flex items-center gap-1"><Ambulance className="h-3 w-3" /> Ambulances</span>
                </div>
                <div className="mt-1 flex gap-2 text-xs">
                  <span className="rounded bg-green-100 px-2 py-0.5 text-green-700">Accessible routes</span>
                  <span className="rounded bg-red-100 px-2 py-0.5 text-red-700">Blocked roads</span>
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION 9: Disaster Tasks */}
          <Card>
            <SectionTitle className="mb-3">Disaster Tasks</SectionTitle>
            <div className="space-y-2">
              {hospital.tasks.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${t.done ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
                >
                  <button
                    onClick={() => toggleTask(hospital.id, t.id)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                      t.done ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'
                    }`}
                  >
                    {t.done && <Check className="h-3 w-3" />}
                  </button>
                  <div className="flex-1">
                    <span className={`text-sm ${t.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{t.description}</span>
                  </div>
                  <PriorityBadge priority={t.priority} size="sm" />
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" /> {t.dueIn}m
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
