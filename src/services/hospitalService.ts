import { apiFetch } from './api';
import type { Hospital } from '@/types';

function mapApiHospital(api: any): Hospital {
  return {
    id: api.id,
    name: api.name,
    coords: { lat: api.latitude, lng: api.longitude },
    emergencyBeds: api.emergency_beds ?? 0,
    emergencyBedsTotal: api.emergency_beds_total ?? 20,
    icu: api.icu ?? 0,
    icuTotal: api.icu_total ?? 10,
    ventilators: api.ventilators ?? 0,
    ventilatorsTotal: api.ventilators_total ?? 10,
    isolationBeds: api.isolation_beds ?? 0,
    isolationBedsTotal: api.isolation_beds_total ?? 10,
    incoming: api.incoming ?? 0,
    status: api.status ?? 'operational',
    lastUpdated: Date.now(),
    edOpen: api.ed_open ?? true,
    ambulanceReceiving: api.ambulance_receiving ?? true,
    disasterCapacity: api.disaster_capacity ?? 'operational',
    ambulances: api.ambulances ?? [{ id: 'A01', status: 'available' }],
    externalAmbulancesIncoming: api.external_ambulances_incoming ?? 0,
    receivesTrauma: api.receives_trauma ?? true,
    receivesMedical: api.receives_medical ?? true,
    receivesBurns: api.receives_burns ?? false,
    receivesPediatric: api.receives_pediatric ?? true,
    receivesCritical: api.receives_critical ?? true,
    doctors: api.doctors ?? 8,
    emergencySpecialists: api.emergency_specialists ?? 3,
    nurses: api.nurses ?? 21,
    bloodO: api.blood_o ?? 'available',
    bloodA: api.blood_a ?? 'available',
    bloodB: api.blood_b ?? 'available',
    bloodAB: api.blood_ab ?? 'available',
    oxygen: api.oxygen ?? 'available',
    incomingCritical: api.incoming_critical ?? 0,
    incomingSerious: api.incoming_serious ?? 0,
    incomingModerate: api.incoming_moderate ?? 0,
    expectedNext30: api.expected_next_30 ?? 0,
    expectedNext2Hrs: api.expected_next_2hrs ?? 0,
    aiWarning: api.ai_warning ?? null,
    aiWarningReasons: api.ai_warning_reasons ?? [],
    accessibility: api.accessibility ?? { mainEntrance: 'accessible', emergencyEntrance: 'accessible', notes: [] },
    tasks: api.tasks ?? [],
    resourceRequests: api.resource_requests ?? [],
  };
}

export const hospitalService = {
  async getAll(): Promise<Hospital[]> {
    const data = await apiFetch<any[]>('/hospitals');
    return data.map(mapApiHospital);
  },

  async updateCapacity(id: string, data: { available_beds?: number; available_icu?: number; incoming_patients?: number }): Promise<any> {
    return apiFetch<any>(`/hospitals/${id}/capacity`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
