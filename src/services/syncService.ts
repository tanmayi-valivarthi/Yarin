import { apiFetch } from './api';
import type { EmergencyCreateInput } from './emergencyService';

export const syncService = {
  async syncEmergencies(reports: EmergencyCreateInput[]): Promise<any> {
    const body = reports.map((r) => ({
      disaster_type: r.disasterType,
      description: r.description,
      latitude: r.coords.lat,
      longitude: r.coords.lng,
      location_label: r.location,
      people_affected: r.peopleAffected,
      injured_count: r.injured ? 1 : 0,
      vulnerable_people: r.vulnerable,
      immediate_danger: r.immediateDanger,
    }));
    return apiFetch<any>('/sync/emergencies', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};
