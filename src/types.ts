export type Role =
  | 'citizen'
  | 'authority'
  | 'rescue'
  | 'hospital';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type EmergencyStatus =
  | 'reported'
  | 'triaged'
  | 'resource_assigned'
  | 'en_route'
  | 'arrived'
  | 'resolved';

export type DisasterType =
  | 'flood'
  | 'cyclone'
  | 'earthquake'
  | 'landslide'
  | 'forest_fire';

export type ResourceStatus = 'available' | 'assigned' | 'unavailable' | 'low_stock';

export type ResourceKind =
  | 'rescue_vehicle'
  | 'boat'
  | 'ambulance'
  | 'medical_team'
  | 'food'
  | 'water'
  | 'medicines'
  | 'volunteers'
  | 'shelter';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Emergency {
  id: string;
  disasterType: DisasterType;
  description: string;
  location: string;
  coords: LatLng;
  peopleAffected: number;
  injured: boolean;
  vulnerable: boolean;
  immediateDanger: boolean;
  priority: Priority;
  status: EmergencyStatus;
  assignedTeam?: string;
  assignedResource?: string;
  eta?: number; // minutes
  createdAt: number;
  updates: { time: number; text: string }[];
  aiReasons: string[];
}

export interface Resource {
  id: string;
  kind: ResourceKind;
  name: string;
  status: ResourceStatus;
  location: string;
  coords: LatLng;
  distance?: number; // km
  eta?: number; // min
  capacity?: number;
  assignedTo?: string;
}

export interface Road {
  id: string;
  name: string;
  path: LatLng[];
  blocked: boolean;
  conflict?: boolean;
}

export interface Shelter {
  id: string;
  name: string;
  coords: LatLng;
  occupancy: number;
  capacity: number;
  incoming: number;
  food: 'ok' | 'low' | 'critical';
  water: 'ok' | 'low' | 'critical';
  medicine: 'ok' | 'low' | 'critical';
}

export type HospitalStatus = 'operational' | 'limited' | 'critical' | 'closed';
export type BloodStatus = 'available' | 'low' | 'critical';
export type AmbulanceStatus = 'available' | 'on_mission' | 'returning';
export type AccessStatus = 'accessible' | 'blocked';

export interface HospitalAmbulance {
  id: string;
  status: AmbulanceStatus;
}

export interface HospitalResourceRequest {
  id: string;
  resource: string;
  quantity: number;
  urgency: Priority;
  reason: string;
  status: 'pending' | 'approved' | 'fulfilled';
  createdAt: number;
}

export interface HospitalTask {
  id: string;
  description: string;
  priority: Priority;
  dueIn: number; // minutes
  done: boolean;
}

export interface HospitalAccessibility {
  mainEntrance: AccessStatus;
  emergencyEntrance: AccessStatus;
  notes: string[];
}

export interface Hospital {
  id: string;
  name: string;
  coords: LatLng;
  emergencyBeds: number;
  emergencyBedsTotal: number;
  icu: number;
  icuTotal: number;
  ventilators: number;
  ventilatorsTotal: number;
  isolationBeds: number;
  isolationBedsTotal: number;
  incoming: number;
  status: HospitalStatus;
  lastUpdated: number;
  edOpen: boolean;
  ambulanceReceiving: boolean;
  disasterCapacity: HospitalStatus;
  ambulances: HospitalAmbulance[];
  externalAmbulancesIncoming: number;
  receivesTrauma: boolean;
  receivesMedical: boolean;
  receivesBurns: boolean;
  receivesPediatric: boolean;
  receivesCritical: boolean;
  doctors: number;
  emergencySpecialists: number;
  nurses: number;
  bloodO: BloodStatus;
  bloodA: BloodStatus;
  bloodB: BloodStatus;
  bloodAB: BloodStatus;
  oxygen: BloodStatus;
  incomingCritical: number;
  incomingSerious: number;
  incomingModerate: number;
  expectedNext30: number;
  expectedNext2Hrs: number;
  aiWarning: string | null;
  aiWarningReasons: string[];
  accessibility: HospitalAccessibility;
  tasks: HospitalTask[];
  resourceRequests: HospitalResourceRequest[];
}

export interface MissingPerson {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  lastLocation: string;
  description: string;
  contact: string;
  status: 'missing' | 'potential_match' | 'found';
  reportedAt: number;
  photo?: string;
  possibleMatchAt?: string;
  matchReasons?: string[];
}

export interface FoundPerson {
  id: string;
  foundAt: string;
  description: string;
  approxAge: number;
  gender: 'male' | 'female' | 'other';
  registeredAt: number;
}

export interface AppNotification {
  id: string;
  time: number;
  text: string;
  level: Priority | 'info';
  roles: Role[];
  read: boolean;
}

export interface HazardZone {
  id: string;
  type: DisasterType;
  label: string;
  center: LatLng;
  radius: number; // meters
  expanding: boolean;
}

export interface Message {
  id: string;
  time: number;
  from: string;
  to: string;
  text: string;
  emergencyId?: string;
}

export const STATUS_FLOW: EmergencyStatus[] = [
  'reported',
  'triaged',
  'resource_assigned',
  'en_route',
  'arrived',
  'resolved',
];

export const ROLE_LABELS: Record<Role, string> = {
  citizen: 'Citizen',
  authority: 'Authority / Operations',
  rescue: 'Rescue Team',
  hospital: 'Hospital',
};
