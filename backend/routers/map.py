from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Emergency, Resource, Hospital, Shelter, Road, HazardZone

router = APIRouter(prefix="/map", tags=["map"])


@router.get("/emergencies")
def map_emergencies(db: Session = Depends(get_db)):
    items = db.query(Emergency).all()
    return [
        {
            "id": e.id, "latitude": e.latitude, "longitude": e.longitude,
            "priority": e.priority_level.lower(), "location": e.location_label,
            "people_affected": e.people_affected, "injured": e.injured_count > 0,
            "status": e.status.lower(), "description": e.description,
            "disaster_type": e.disaster_type, "vulnerable": e.vulnerable_people,
            "immediate_danger": e.immediate_danger,
            "assigned_resource_id": e.assigned_resource_id, "eta_minutes": e.eta_minutes,
        }
        for e in items
    ]


@router.get("/resources")
def map_resources(db: Session = Depends(get_db)):
    items = db.query(Resource).all()
    return [
        {
            "id": r.id, "name": r.name, "type": r.type,
            "latitude": r.latitude, "longitude": r.longitude,
            "status": r.status.lower(), "capacity": r.capacity,
            "assigned_to": r.current_assignment, "eta_minutes": r.eta_minutes,
        }
        for r in items
    ]


@router.get("/hospitals")
def map_hospitals(db: Session = Depends(get_db)):
    items = db.query(Hospital).all()
    return [
        {
            "id": h.id, "name": h.name, "latitude": h.latitude, "longitude": h.longitude,
            "emergency_beds": h.available_beds, "emergency_beds_total": h.emergency_capacity,
            "icu": h.available_icu, "icu_total": h.icu_capacity, "incoming": h.incoming_patients,
        }
        for h in items
    ]


@router.get("/shelters")
def map_shelters(db: Session = Depends(get_db)):
    items = db.query(Shelter).all()
    return [
        {
            "id": s.id, "name": s.name, "latitude": s.latitude, "longitude": s.longitude,
            "occupancy": s.current_occupancy, "capacity": s.capacity, "incoming": s.incoming_evacuees,
            "food": s.food_status.lower(), "water": s.water_status.lower(), "medicine": s.medicine_status.lower(),
        }
        for s in items
    ]


@router.get("/roads")
def map_roads(db: Session = Depends(get_db)):
    items = db.query(Road).all()
    return [
        {
            "id": r.id, "name": r.name,
            "path": [
                {"lat": r.start_lat, "lng": r.start_lng},
                {"lat": r.mid_lat, "lng": r.mid_lng},
                {"lat": r.end_lat, "lng": r.end_lng},
            ],
            "blocked": r.status == "BLOCKED",
            "conflict": r.accessibility == "CONFLICT",
        }
        for r in items
    ]


@router.get("/hazards")
def map_hazards(db: Session = Depends(get_db)):
    items = db.query(HazardZone).all()
    return [
        {
            "id": h.id, "label": h.name, "type": h.disaster_type,
            "center": {"lat": h.latitude, "lng": h.longitude},
            "radius": h.radius_meters, "expanding": h.severity == "high",
        }
        for h in items
    ]
