import { apiFetch } from './api';

export const replanningService = {
  async trigger(eventType: string, entityId: string): Promise<any> {
    return apiFetch<any>('/replanning/trigger', {
      method: 'POST',
      body: JSON.stringify({ event_type: eventType, entity_id: entityId }),
    });
  },

  async blockRoad(roadId: string = 'R12'): Promise<any> {
    return apiFetch<any>(`/demo/block-road?road_id=${roadId}`, { method: 'POST' });
  },

  async resourceUnavailable(resourceId: string = 'R-03'): Promise<any> {
    return apiFetch<any>(`/demo/resource-unavailable?resource_id=${resourceId}`, { method: 'POST' });
  },

  async shelterFull(shelterId: string = 'S-B'): Promise<any> {
    return apiFetch<any>(`/demo/shelter-full?shelter_id=${shelterId}`, { method: 'POST' });
  },

  async hospitalFull(hospitalId: string = 'H-02'): Promise<any> {
    return apiFetch<any>(`/demo/hospital-full?hospital_id=${hospitalId}`, { method: 'POST' });
  },

  async expandHazard(hazardId: string = 'HZ-A'): Promise<any> {
    return apiFetch<any>(`/demo/expand-hazard?hazard_id=${hazardId}`, { method: 'POST' });
  },

  async newEmergency(): Promise<any> {
    return apiFetch<any>('/demo/new-emergency', { method: 'POST' });
  },
};
