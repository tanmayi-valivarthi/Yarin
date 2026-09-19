import { apiFetch } from './api';
import type { Resource, ResourceKind, ResourceStatus } from '@/types';

function mapApiResource(api: any): Resource {
  return {
    id: api.id,
    kind: (api.type || 'rescue_vehicle') as ResourceKind,
    name: api.name,
    status: (api.status || 'available').toLowerCase().replace(/ /g, '_') as ResourceStatus,
    location: '',
    coords: { lat: api.latitude, lng: api.longitude },
    capacity: api.capacity,
    distance: api.distance_km,
    eta: api.eta_minutes,
    assignedTo: api.assigned_to,
  };
}

export const resourceService = {
  async getAll(): Promise<Resource[]> {
    const data = await apiFetch<any[]>('/resources');
    return data.map(mapApiResource);
  },

  async recommend(emergencyId: string): Promise<any> {
    return apiFetch<any>('/allocations/recommend', {
      method: 'POST',
      body: JSON.stringify({ emergency_id: emergencyId }),
    });
  },

  async assign(emergencyId: string, resourceId: string): Promise<any> {
    return apiFetch<any>('/allocations/assign', {
      method: 'POST',
      body: JSON.stringify({ emergency_id: emergencyId, resource_id: resourceId }),
    });
  },

  async updateAssignmentStatus(assignmentId: string, status: string): Promise<any> {
    return apiFetch<any>(`/allocations/${assignmentId}/status?status=${status}`, {
      method: 'PATCH',
    });
  },
};
