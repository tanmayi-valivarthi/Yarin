from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Emergency, Road, Resource, Shelter, Hospital, HazardZone
from backend.decision_engines.triage import calculate_priority
from backend.decision_engines.replanning import (
    trigger_road_blocked, trigger_resource_unavailable,
    trigger_hazard_expand, trigger_shelter_full, trigger_hospital_capacity,
)
from backend.schemas import EmergencyCreate
from backend.routers.replanning import set_broadcast
import json

router = APIRouter(prefix="/demo", tags=["demo"])

_broadcast = None


def set_demo_broadcast(fn):
    global _broadcast
    _broadcast = fn


@router.post("/new-emergency")
def demo_new_emergency(db: Session = Depends(get_db)):
    eid = f"E-{db.query(Emergency).count() + 200}"
    score, level, explanation, severity, med = calculate_priority(
        people_affected=5, injured_count=1, vulnerable_people=True, immediate_danger=True,
    )
    e = Emergency(
        id=eid, disaster_type="flood",
        description="Urgent: family trapped, water rising fast.",
        latitude=26.916, longitude=75.778, location_label="Zone A, Riverside",
        people_affected=5, injured_count=1, vulnerable_people=True, immediate_danger=True,
        severity=severity, medical_urgency=med, priority_score=score, priority_level=level,
        status="TRIAGED", explanation=json.dumps(explanation),
    )
    db.add(e)
    db.commit()
    if _broadcast:
        _broadcast({"type": "NEW_EMERGENCY", "emergency_id": eid, "priority": level})
    return {"id": eid, "priority_level": level, "priority_score": score}


@router.post("/block-road")
def demo_blockRoad(road_id: str = "R12", db: Session = Depends(get_db)):
    result = trigger_road_blocked(db, road_id)
    if _broadcast:
        _broadcast({"type": "ROAD_BLOCKED", "road_id": road_id, "result": result})
    return result


@router.post("/resource-unavailable")
def demo_resource_unavailable(resource_id: str = "R-03", db: Session = Depends(get_db)):
    result = trigger_resource_unavailable(db, resource_id)
    if _broadcast:
        _broadcast({"type": "RESOURCE_UNAVAILABLE", "resource_id": resource_id, "result": result})
    return result


@router.post("/shelter-full")
def demo_shelter_full(shelter_id: str = "S-B", db: Session = Depends(get_db)):
    result = trigger_shelter_full(db, shelter_id)
    if _broadcast:
        _broadcast({"type": "SHELTER_FULL", "shelter_id": shelter_id, "result": result})
    return result


@router.post("/hospital-full")
def demo_hospital_full(hospital_id: str = "H-02", db: Session = Depends(get_db)):
    result = trigger_hospital_capacity(db, hospital_id)
    if _broadcast:
        _broadcast({"type": "HOSPITAL_CAPACITY_CHANGE", "hospital_id": hospital_id, "result": result})
    return result


@router.post("/expand-hazard")
def demo_expand_hazard(hazard_id: str = "HZ-A", db: Session = Depends(get_db)):
    result = trigger_hazard_expand(db, hazard_id)
    if _broadcast:
        _broadcast({"type": "HAZARD_ZONE_EXPANDED", "hazard_id": hazard_id, "result": result})
    return result
