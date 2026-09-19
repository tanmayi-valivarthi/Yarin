import { apiFetch } from './api';
import type { Shelter } from '@/types';

function mapApiShelter(api: any): Shelter {
  return {
    id: api.id,
    name: api.name,
    coords: { lat: api.latitude, lng: api.longitude },
    occupancy: api.occupancy,
    capacity: api.capacity,
    incoming: api.incoming,
    food: api.food,
    water: api.water,
    medicine: api.medicine,
  };
}

export const shelterService = {
  async getAll(): Promise<Shelter[]> {
    const data = await apiFetch<any[]>('/shelters');
    return data.map(mapApiShelter);
  },

  async updateOccupancy(id: string, data: { current_occupancy?: number; incoming_evacuees?: number }): Promise<any> {
    return apiFetch<any>(`/shelters/${id}/occupancy`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
