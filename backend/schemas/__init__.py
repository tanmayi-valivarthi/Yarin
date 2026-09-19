from pydantic import BaseModel, Field
from typing import Optional


class EmergencyCreate(BaseModel):
    disaster_type: str = "flood"
    description: str = ""
    latitude: float = 0.0
    longitude: float = 0.0
    location_label: str = ""
    people_affected: int = 1
    injured_count: int = 0
    vulnerable_people: bool = False
    immediate_danger: bool = False


class EmergencyUpdate(BaseModel):
    status: Optional[str] = None


class EmergencyOut(BaseModel):
    id: str
    disaster_type: str
    description: str
    latitude: float
    longitude: float
    location_label: str
    people_affected: int
    injured_count: int
    vulnerable_people: bool
    immediate_danger: bool
    severity: str
    medical_urgency: str
    priority_score: int
    priority_level: str
    status: str
    assigned_resource_id: Optional[str] = None
    eta_minutes: Optional[int] = None
    explanation: str
    created_at: str
    updated_at: str


class ResourceOut(BaseModel):
    id: str
    name: str
    type: str
    latitude: float
    longitude: float
    capacity: int
    status: str
    current_assignment: Optional[str] = None
    eta_minutes: Optional[int] = None
    distance_km: float


class HospitalOut(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    emergency_capacity: int
    available_beds: int
    icu_capacity: int
    available_icu: int
    incoming_patients: int
    status: str


class HospitalCapacityUpdate(BaseModel):
    available_beds: Optional[int] = None
    available_icu: Optional[int] = None
    incoming_patients: Optional[int] = None


class ShelterOut(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    capacity: int
    current_occupancy: int
    incoming_evacuees: int
    food_status: str
    water_status: str
    medicine_status: str
    status: str


class ShelterOccupancyUpdate(BaseModel):
    current_occupancy: Optional[int] = None
    incoming_evacuees: Optional[int] = None


class RoadOut(BaseModel):
    id: str
    name: str
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    mid_lat: float
    mid_lng: float
    status: str
    accessibility: str


class HazardZoneOut(BaseModel):
    id: str
    name: str
    disaster_type: str
    severity: str
    latitude: float
    longitude: float
    radius_meters: int
    status: str


class MissingPersonCreate(BaseModel):
    name: str = "Unknown"
    approximate_age: int = 0
    gender: str = "male"
    last_known_location: str = ""
    description: str = ""
    photo_url: Optional[str] = None
    contact_info: str = ""


class MissingPersonOut(BaseModel):
    id: str
    name: str
    approximate_age: int
    gender: str
    last_known_location: str
    description: str
    photo_url: Optional[str] = None
    contact_info: str
    status: str
    found_at: Optional[str] = None
    match_reasons: str
    created_at: str


class PotentialMatchRequest(BaseModel):
    found_at: str = ""
    reasons: list[str] = []


class AllocationRecommendRequest(BaseModel):
    emergency_id: str


class AllocationAssignRequest(BaseModel):
    emergency_id: str
    resource_id: str


class AssignmentStatusUpdate(BaseModel):
    status: str


class ReplanningTriggerRequest(BaseModel):
    event_type: str
    entity_id: str


class DemoBlockRoadRequest(BaseModel):
    road_id: str = "R12"
