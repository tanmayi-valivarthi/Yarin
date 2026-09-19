import { apiFetch } from './api';
import type { Emergency, Resource, Road, Shelter, Hospital, HazardZone } from '@/types';

export const mapService = {
  async getEmergencies(): Promise<any[]> {
    return apiFetch<any[]>('/map/emergencies');
  },
  async getResources(): Promise<any[]> {
    return apiFetch<any[]>('/map/resources');
  },
  async getHospitals(): Promise<any[]> {
    return apiFetch<any[]>('/map/hospitals');
  },
  async getShelters(): Promise<any[]> {
    return apiFetch<any[]>('/map/shelters');
  },
  async getRoads(): Promise<Road[]> {
    const data = await apiFetch<any[]>('/map/roads');
    return data.map((r) => ({
      id: r.id, name: r.name, path: r.path,
      blocked: r.blocked, conflict: r.conflict,
    }));
  },
  async getHazards(): Promise<HazardZone[]> {
    const data = await apiFetch<any[]>('/map/hazards');
    return data.map((h) => ({
      id: h.id, type: h.type, label: h.label,
      center: h.center, radius: h.radius, expanding: h.expanding,
    }));
  },
};
