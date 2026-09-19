import { apiFetch } from './api';
import type { MissingPerson } from '@/types';

function mapApiMissing(api: any): MissingPerson {
  return {
    id: api.id,
    name: api.name,
    age: api.age,
    gender: api.gender,
    lastLocation: api.last_location,
    description: api.description,
    contact: api.contact,
    status: (api.status || 'missing').replace(/ /g, '_') as MissingPerson['status'],
    reportedAt: api.reported_at ? new Date(api.reported_at).getTime() : Date.now(),
    possibleMatchAt: api.possible_match_at,
    matchReasons: api.match_reasons || [],
  };
}

export const missingPersonService = {
  async getAll(): Promise<MissingPerson[]> {
    const data = await apiFetch<any[]>('/missing-persons');
    return data.map(mapApiMissing);
  },

  async create(data: {
    name: string; age: number; gender: string; lastLocation: string;
    description: string; contact: string;
  }): Promise<any> {
    return apiFetch<any>('/missing-persons', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name, approximate_age: data.age, gender: data.gender,
        last_known_location: data.lastLocation, description: data.description,
        contact_info: data.contact,
      }),
    });
  },

  async markPotentialMatch(id: string, foundAt: string, reasons: string[]): Promise<any> {
    return apiFetch<any>(`/missing-persons/${id}/potential-matches`, {
      method: 'POST',
      body: JSON.stringify({ found_at: foundAt, reasons }),
    });
  },

  async verifyMatch(id: string): Promise<any> {
    return apiFetch<any>(`/missing-persons/${id}/verify-match`, {
      method: 'POST',
    });
  },
};
