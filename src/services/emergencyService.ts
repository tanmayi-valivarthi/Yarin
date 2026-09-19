import { apiFetch } from './api';
import type { Emergency, EmergencyStatus, Priority, DisasterType, LatLng } from '@/types';

export interface EmergencyCreateInput {
  disasterType: DisasterType;
  description: string;
  coords: LatLng;
  location: string;
  peopleAffected: number;
  injured: boolean;
  vulnerable: boolean;
  immediateDanger: boolean;
}

export interface TriageResult {
  id: string;
  priority_level: string;
  priority_score: number;
  status: string;
  explanation: string;
}

function mapApiEmergency(api: any): Emergency {
  const reasons: string[] = (() => {
    try { return JSON.parse(api.explanation || '[]'); } catch { return []; }
  })();
  return {
    id: api.id,
    disasterType: api.disaster_type,
    description: api.description,
    location: api.location_label,
    coords: { lat: api.latitude, lng: api.longitude },
    peopleAffected: api.people_affected,
    injured: api.injured_count > 0,
    vulnerable: api.vulnerable_people,
    immediateDanger: api.immediate_danger,
    priority: (api.priority_level || 'medium').toLowerCase() as Priority,
    status: (api.status || 'reported').toLowerCase().replace(/-/g, '_') as EmergencyStatus,
    assignedResource: api.assigned_resource_id ?? undefined,
    eta: api.eta_minutes ?? undefined,
    createdAt: api.created_at ? new Date(api.created_at).getTime() : Date.now(),
    updates: [],
    aiReasons: reasons,
  };
}

export const emergencyService = {
  async getAll(): Promise<Emergency[]> {
    const data = await apiFetch<any[]>('/emergencies');
    return data.map(mapApiEmergency);
  },

  async getById(id: string): Promise<Emergency> {
    const data = await apiFetch<any>(`/emergencies/${id}`);
    return mapApiEmergency(data);
  },

  async create(input: EmergencyCreateInput): Promise<TriageResult> {
    const body = {
      disaster_type: input.disasterType,
      description: input.description,
      latitude: input.coords.lat,
      longitude: input.coords.lng,
      location_label: input.location,
      people_affected: input.peopleAffected,
      injured_count: input.injured ? 1 : 0,
      vulnerable_people: input.vulnerable,
      immediate_danger: input.immediateDanger,
    };
    return apiFetch<TriageResult>('/emergencies', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async updateStatus(id: string, status: EmergencyStatus): Promise<void> {
    await apiFetch(`/emergencies/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
