import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  AppNotification,
  Emergency,
  EmergencyStatus,
  FoundPerson,
  HazardZone,
  Hospital,
  Message,
  MissingPerson,
  Priority,
  Resource,
  Road,
  Shelter,
} from './types';
import {
  initialEmergencies,
  initialFoundPersons,
  initialHazardZones,
  initialHospitals,
  initialMessages,
  initialMissingPersons,
  initialNotifications,
  initialResources,
  initialRoads,
  initialShelters,
} from './data';
import { emergencyService, type EmergencyCreateInput } from './services/emergencyService';
import { resourceService } from './services/resourceService';
import { hospitalService } from './services/hospitalService';
import { missingPersonService } from './services/missingPersonService';
import { mapService } from './services/mapService';
import { replanningService } from './services/replanningService';
import { syncService } from './services/syncService';
import { useWebSocket, type WsEvent } from './hooks/useWebSocket';

interface Store {
  role: string | null;
  setRole: (r: string | null) => void;
  online: boolean;
  setOnline: (v: boolean) => void;
  loading: boolean;
  apiError: string | null;
  pendingReports: number;
  emergencies: Emergency[];
  resources: Resource[];
  roads: Road[];
  shelters: Shelter[];
  hospitals: Hospital[];
  hazardZones: HazardZone[];
  missingPersons: MissingPerson[];
  foundPersons: FoundPerson[];
  messages: Message[];
  notifications: AppNotification[];
  addEmergency: (e: Emergency) => void;
  submitEmergency: (input: EmergencyCreateInput) => Promise<Emergency | null>;
  updateEmergencyStatus: (id: string, status: EmergencyStatus, update?: string) => void;
  assignResource: (emergencyId: string, resourceId: string) => void;
  blockRoad: (id: string, blocked: boolean) => void;
  setRoadConflict: (id: string, conflict: boolean) => void;
  expandHazard: (id: string) => void;
  addNotification: (n: AppNotification) => void;
  markNotificationsRead: () => void;
  addMissingPerson: (p: MissingPerson) => void;
  markPotentialMatch: (id: string, at: string, reasons: string[]) => void;
  confirmMatch: (id: string) => void;
  addFoundPerson: (f: FoundPerson) => void;
  addMessage: (m: Message) => void;
  setHospitalIncoming: (id: string, n: number) => void;
  updateHospital: (id: string, updates: Partial<import('./types').Hospital>) => void;
  toggleReceives: (id: string, field: 'receivesTrauma' | 'receivesMedical' | 'receivesBurns' | 'receivesPediatric' | 'receivesCritical') => void;
  toggleTask: (hospitalId: string, taskId: string) => void;
  sendResourceRequest: (hospitalId: string, req: { resource: string; quantity: number; urgency: import('./types').Priority; reason: string }) => void;
  addAccessibilityNote: (hospitalId: string, note: string) => void;
  simulateRoadBlock: () => void;
  simulateCompetingEmergencies: () => void;
  resetSimulation: () => void;
  pendingSyncCount: number;
  setPendingSyncCount: (n: number) => void;
  refreshAll: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

// Keys for localStorage offline queue
const OFFLINE_QUEUE_KEY = 'resqnet_offline_queue';

function loadOfflineQueue(): EmergencyCreateInput[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOfflineQueue(items: EmergencyCreateInput[]) {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(items));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // Start with mock data as fallback, replace with API data when loaded
  const [emergencies, setEmergencies] = useState<Emergency[]>(initialEmergencies);
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [roads, setRoads] = useState<Road[]>(initialRoads);
  const [shelters, setShelters] = useState<Shelter[]>(initialShelters);
  const [hospitals, setHospitals] = useState<Hospital[]>(initialHospitals);
  const [hazardZones, setHazardZones] = useState<HazardZone[]>(initialHazardZones);
  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>(initialMissingPersons);
  const [foundPersons] = useState<FoundPerson[]>(initialFoundPersons);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [pendingReports, setPendingReports] = useState(0);

  const addNotification = useCallback((n: AppNotification) => {
    setNotifications((prev) => [n, ...prev]);
  }, []);

  // ---- Data fetching ----
  const refreshAll = useCallback(async () => {
    try {
      setApiError(null);
      const [emgs, res, rds, shs, hos, hzs, mps] = await Promise.all([
        emergencyService.getAll(),
        resourceService.getAll(),
        mapService.getRoads(),
        Promise.resolve(shelters),
        hospitalService.getAll(),
        mapService.getHazards(),
        missingPersonService.getAll(),
      ]);
      setEmergencies(emgs);
      setResources(res);
      setRoads(rds);
      setShelters(shs);
      setHospitals(hos);
      setHazardZones(hzs);
      setMissingPersons(mps);
      setLoading(false);
    } catch (err: any) {
      setApiError(err?.message || 'Unable to connect to server');
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // ---- WebSocket for real-time updates ----
  const handleWsEvent = useCallback((event: WsEvent) => {
    switch (event.type) {
      case 'NEW_EMERGENCY':
      case 'ROAD_BLOCKED':
      case 'RESOURCE_UNAVAILABLE':
      case 'SHELTER_FULL':
      case 'HOSPITAL_CAPACITY_CHANGE':
      case 'HAZARD_ZONE_EXPANDED':
      case 'REPLANNING':
        // Refresh all data from backend after any event
        refreshAll();
        // Add a notification
        addNotification({
          id: `N-${Date.now()}`,
          time: Date.now(),
          text: wsEventToText(event),
          level: wsEventToLevel(event),
          roles: ['authority', 'rescue', 'hospital'],
          read: false,
        });
        break;
    }
  }, [refreshAll, addNotification]);

  useWebSocket(handleWsEvent);

  // ---- Offline queue sync ----
  const syncOfflineQueue = useCallback(async () => {
    const queue = loadOfflineQueue();
    if (queue.length === 0) return;
    setPendingSyncCount(queue.length);
    try {
      await syncService.syncEmergencies(queue);
      saveOfflineQueue([]);
      setPendingSyncCount(0);
      setPendingReports(0);
      refreshAll();
      addNotification({
        id: `N-${Date.now()}`,
        time: Date.now(),
        text: `${queue.length} emergency report(s) synchronized.`,
        level: 'info',
        roles: ['citizen', 'authority'],
        read: false,
      });
    } catch {
      // Will retry next time online
    }
  }, [refreshAll, addNotification]);

  // When coming back online, sync queued reports
  useEffect(() => {
    if (online) {
      syncOfflineQueue();
    }
  }, [online, syncOfflineQueue]);

  // ---- Emergency submission (with offline support) ----
  const submitEmergency = useCallback(
    async (input: EmergencyCreateInput): Promise<Emergency | null> => {
      if (!online) {
        // Save to offline queue
        const queue = loadOfflineQueue();
        queue.push(input);
        saveOfflineQueue(queue);
        setPendingReports(queue.length);
        // Return a local placeholder
        const localEmergency: Emergency = {
          id: `LOCAL-${Date.now()}`,
          disasterType: input.disasterType,
          description: input.description,
          location: input.location,
          coords: input.coords,
          peopleAffected: input.peopleAffected,
          injured: input.injured,
          vulnerable: input.vulnerable,
          immediateDanger: input.immediateDanger,
          priority: 'critical',
          status: 'reported',
          createdAt: Date.now(),
          updates: [{ time: Date.now(), text: 'Report saved locally (offline).' }],
          aiReasons: ['Report queued — will be triaged when connectivity returns.'],
        };
        return localEmergency;
      }

      try {
        const result = await emergencyService.create(input);
        await refreshAll();
        const created = await emergencyService.getById(result.id);
        return created;
      } catch (err: any) {
        setApiError(err?.message || 'Failed to submit emergency');
        // Save to offline queue as fallback
        const queue = loadOfflineQueue();
        queue.push(input);
        saveOfflineQueue(queue);
        setPendingReports(queue.length);
        return null;
      }
    },
    [online, refreshAll],
  );

  // Legacy addEmergency (for backward compat with DemoPanel)
  const addEmergency = useCallback(
    (e: Emergency) => {
      if (online) {
        setEmergencies((prev) => [e, ...prev]);
        addNotification({
          id: `N-${Date.now()}`,
          time: Date.now(),
          text: `New ${e.priority} SOS received — ${e.id}, ${e.location}.`,
          level: e.priority === 'critical' ? 'critical' : 'high',
          roles: ['authority', 'rescue'],
          read: false,
        });
      } else {
        setPendingReports((n) => n + 1);
      }
    },
    [online, addNotification],
  );

  const updateEmergencyStatus = useCallback(
    async (id: string, status: EmergencyStatus, update?: string) => {
      // Optimistic update
      setEmergencies((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                status,
                updates: update
                  ? [...e.updates, { time: Date.now(), text: update }]
                  : e.updates,
              }
            : e,
        ),
      );
      // Persist to backend
      try {
        await emergencyService.updateStatus(id, status);
      } catch {
        // Keep optimistic update even if backend fails
      }
    },
    [],
  );

  const assignResource = useCallback(
    async (emergencyId: string, resourceId: string) => {
      // Optimistic
      setResources((prev) =>
        prev.map((r) =>
          r.id === resourceId
            ? { ...r, status: 'assigned', assignedTo: emergencyId }
            : r,
        ),
      );
      setEmergencies((prev) =>
        prev.map((e) =>
          e.id === emergencyId
            ? {
                ...e,
                status: 'resource_assigned',
                assignedResource: resourceId,
                updates: [
                  ...e.updates,
                  { time: Date.now(), text: `Resource ${resourceId} assigned.` },
                ],
              }
            : e,
        ),
      );
      // Persist
      try {
        await resourceService.assign(emergencyId, resourceId);
        await refreshAll();
      } catch {
        // Keep optimistic state
      }
    },
    [refreshAll],
  );

  const blockRoad = useCallback((id: string, blocked: boolean) => {
    setRoads((prev) => prev.map((r) => (r.id === id ? { ...r, blocked } : r)));
  }, []);

  const setRoadConflict = useCallback((id: string, conflict: boolean) => {
    setRoads((prev) => prev.map((r) => (r.id === id ? { ...r, conflict } : r)));
  }, []);

  const expandHazard = useCallback(
    async (id: string) => {
      setHazardZones((prev) =>
        prev.map((z) => (z.id === id ? { ...z, radius: z.radius * 1.4, expanding: true } : z)),
      );
      try {
        await replanningService.expandHazard(id);
        await refreshAll();
      } catch { /* keep optimistic */ }
    },
    [refreshAll],
  );

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addMissingPerson = useCallback(
    async (p: MissingPerson) => {
      setMissingPersons((prev) => [p, ...prev]);
      try {
        await missingPersonService.create({
          name: p.name, age: p.age, gender: p.gender,
          lastLocation: p.lastLocation, description: p.description, contact: p.contact,
        });
        await refreshAll();
      } catch { /* keep optimistic */ }
    },
    [refreshAll],
  );

  const markPotentialMatch = useCallback(
    async (id: string, at: string, reasons: string[]) => {
      setMissingPersons((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: 'potential_match', possibleMatchAt: at, matchReasons: reasons }
            : p,
        ),
      );
      try {
        await missingPersonService.markPotentialMatch(id, at, reasons);
        await refreshAll();
      } catch { /* keep optimistic */ }
    },
    [refreshAll],
  );

  const confirmMatch = useCallback(
    async (id: string) => {
      setMissingPersons((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'found' } : p)),
      );
      try {
        await missingPersonService.verifyMatch(id);
        await refreshAll();
      } catch { /* keep optimistic */ }
    },
    [refreshAll],
  );

  const addFoundPerson = useCallback((f: FoundPerson) => {
    // foundPersons is read-only state in this prototype; would persist via API
  }, []);

  const addMessage = useCallback((m: Message) => {
    setMessages((prev) => [...prev, m]);
  }, []);

  const setHospitalIncoming = useCallback(
    async (id: string, n: number) => {
      setHospitals((prev) => prev.map((h) => (h.id === id ? { ...h, incoming: n } : h)));
      try {
        await hospitalService.updateCapacity(id, { incoming_patients: n });
        await refreshAll();
      } catch { /* keep optimistic */ }
    },
    [refreshAll],
  );

  const updateHospital = useCallback(
    (id: string, updates: Partial<Hospital>) => {
      setHospitals((prev) =>
        prev.map((h) => (h.id === id ? { ...h, ...updates, lastUpdated: Date.now() } : h)),
      );
    },
    [],
  );

  const toggleReceives = useCallback(
    (id: string, field: 'receivesTrauma' | 'receivesMedical' | 'receivesBurns' | 'receivesPediatric' | 'receivesCritical') => {
      setHospitals((prev) =>
        prev.map((h) => (h.id === id ? { ...h, [field]: !h[field], lastUpdated: Date.now() } : h)),
      );
    },
    [],
  );

  const toggleTask = useCallback((hospitalId: string, taskId: string) => {
    setHospitals((prev) =>
      prev.map((h) =>
        h.id === hospitalId
          ? { ...h, tasks: h.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) }
          : h,
      ),
    );
  }, []);

  const sendResourceRequest = useCallback(
    (hospitalId: string, req: { resource: string; quantity: number; urgency: Priority; reason: string }) => {
      const hospital = hospitals.find((h) => h.id === hospitalId);
      if (!hospital) return;
      const newReq: import('./types').HospitalResourceRequest = {
        id: `RR-${Date.now()}`,
        resource: req.resource,
        quantity: req.quantity,
        urgency: req.urgency,
        reason: req.reason,
        status: 'pending',
        createdAt: Date.now(),
      };
      setHospitals((prev) =>
        prev.map((h) => (h.id === hospitalId ? { ...h, resourceRequests: [newReq, ...h.resourceRequests] } : h)),
      );
      addNotification({
        id: `N-${Date.now()}`,
        time: Date.now(),
        text: `${hospital.name} requests ${req.quantity} units of ${req.resource} — ${req.urgency.toUpperCase()} priority.`,
        level: req.urgency === 'critical' ? 'critical' : req.urgency === 'high' ? 'high' : 'medium',
        roles: ['authority', 'hospital'],
        read: false,
      });
    },
    [hospitals, addNotification],
  );

  const addAccessibilityNote = useCallback((hospitalId: string, note: string) => {
    setHospitals((prev) =>
      prev.map((h) =>
        h.id === hospitalId
          ? { ...h, accessibility: { ...h.accessibility, notes: [...h.accessibility.notes, note] } }
          : h,
      ),
    );
  }, []);

  // ---- Demo simulations (call backend) ----
  const simulateRoadBlock = useCallback(async () => {
    // Optimistic
    setRoads((prev) => prev.map((r) => (r.id === 'R12' ? { ...r, blocked: true } : r)));
    setResources((prev) =>
      prev.map((r) => {
        if (r.id === 'R-01') return { ...r, status: 'unavailable', assignedTo: undefined };
        if (r.id === 'R-04') return { ...r, status: 'assigned', assignedTo: 'E-102', eta: 11 };
        return r;
      }),
    );
    setEmergencies((prev) =>
      prev.map((e) =>
        e.id === 'E-102'
          ? {
              ...e,
              assignedResource: 'R-04',
              eta: 11,
              updates: [
                ...e.updates,
                {
                  time: Date.now(),
                  text: 'Route R12 blocked. Reassigned to R-04 via alternate route. New ETA 11 min.',
                },
              ],
            }
          : e,
      ),
    );
    addNotification({
      id: `N-${Date.now()}`,
      time: Date.now(),
      text: 'Mission E-102 route changed. Road R12 blocked. New ETA 11 min.',
      level: 'high',
      roles: ['rescue', 'authority'],
      read: false,
    });
    // Call backend
    try {
      await replanningService.blockRoad('R12');
      await refreshAll();
    } catch { /* keep optimistic */ }
  }, [addNotification, refreshAll]);

  const simulateCompetingEmergencies = useCallback(() => {
    addNotification({
      id: `N-${Date.now()}`,
      time: Date.now(),
      text: '3 competing emergencies require resource prioritization.',
      level: 'high',
      roles: ['authority'],
      read: false,
    });
  }, [addNotification]);

  const resetSimulation = useCallback(async () => {
    // Reset is a frontend-only concept for the prototype; refresh from backend
    await refreshAll();
  }, [refreshAll]);

  const value = useMemo<Store>(
    () => ({
      role,
      setRole,
      online,
      setOnline,
      loading,
      apiError,
      pendingReports,
      emergencies,
      resources,
      roads,
      shelters,
      hospitals,
      hazardZones,
      missingPersons,
      foundPersons,
      messages,
      notifications,
      addEmergency,
      submitEmergency,
      updateEmergencyStatus,
      assignResource,
      blockRoad,
      setRoadConflict,
      expandHazard,
      addNotification,
      markNotificationsRead,
      addMissingPerson,
      markPotentialMatch,
      confirmMatch,
      addFoundPerson,
      addMessage,
      setHospitalIncoming,
      updateHospital,
      toggleReceives,
      toggleTask,
      sendResourceRequest,
      addAccessibilityNote,
      simulateRoadBlock,
      simulateCompetingEmergencies,
      resetSimulation,
      pendingSyncCount,
      setPendingSyncCount,
      refreshAll,
    }),
    [
      role, online, loading, apiError, pendingReports,
      emergencies, resources, roads, shelters, hospitals,
      hazardZones, missingPersons, foundPersons, messages, notifications,
      addEmergency, submitEmergency, updateEmergencyStatus, assignResource,
      blockRoad, setRoadConflict, expandHazard, addNotification,
      markNotificationsRead, addMissingPerson, markPotentialMatch, confirmMatch,
      addFoundPerson, addMessage, setHospitalIncoming, updateHospital,
      toggleReceives, toggleTask, sendResourceRequest, addAccessibilityNote,
      simulateRoadBlock, simulateCompetingEmergencies, resetSimulation,
      pendingSyncCount, refreshAll,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export const priorityColor: Record<Priority, string> = {
  critical: 'red',
  high: 'orange',
  medium: 'yellow',
  low: 'gray',
};

function wsEventToText(event: WsEvent): string {
  switch (event.type) {
    case 'NEW_EMERGENCY':
      return `New ${event.priority?.toLowerCase() || ''} emergency: ${event.emergency_id || ''}.`;
    case 'ROAD_BLOCKED':
      return `Road ${event.road_id || ''} is blocked. Mission updated.`;
    case 'RESOURCE_UNAVAILABLE':
      return `Resource ${event.resource_id || ''} is now unavailable.`;
    case 'SHELTER_FULL':
      return `Shelter ${event.shelter_id || ''} nearing capacity. Redirect recommended.`;
    case 'HOSPITAL_CAPACITY_CHANGE':
      return `Hospital ${event.hospital_id || ''} capacity changed.`;
    case 'HAZARD_ZONE_EXPANDED':
      return `Hazard zone ${event.hazard_id || ''} has expanded.`;
    case 'REPLANNING':
      return 'Response plan updated due to changing conditions.';
    default:
      return event.type;
  }
}

function wsEventToLevel(event: WsEvent): Priority | 'info' {
  switch (event.type) {
    case 'NEW_EMERGENCY':
      return 'critical';
    case 'ROAD_BLOCKED':
    case 'RESOURCE_UNAVAILABLE':
    case 'SHELTER_FULL':
    case 'HOSPITAL_CAPACITY_CHANGE':
    case 'HAZARD_ZONE_EXPANDED':
    case 'REPLANNING':
      return 'high';
    default:
      return 'info';
  }
}
