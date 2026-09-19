from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json
from backend.database import get_db
from backend.models import Emergency, ResponseAssignment, Resource
from backend.schemas import EmergencyCreate, EmergencyUpdate, EmergencyOut
from backend.decision_engines.triage import calculate_priority

router = APIRouter(prefix="/emergencies", tags=["emergencies"])

ASSIGNMENT_COUNTER = [100]


def to_out(e: Emergency) -> EmergencyOut:
    return EmergencyOut(
        id=e.id, disaster_type=e.disaster_type, description=e.description,
        latitude=e.latitude, longitude=e.longitude, location_label=e.location_label,
        people_affected=e.people_affected, injured_count=e.injured_count,
        vulnerable_people=e.vulnerable_people, immediate_danger=e.immediate_danger,
        severity=e.severity, medical_urgency=e.medical_urgency,
        priority_score=e.priority_score, priority_level=e.priority_level,
        status=e.status, assigned_resource_id=e.assigned_resource_id,
        eta_minutes=e.eta_minutes, explanation=e.explanation,
        created_at=e.created_at.isoformat() if e.created_at else "",
        updated_at=e.updated_at.isoformat() if e.updated_at else "",
    )


@router.get("")
def list_emergencies(db: Session = Depends(get_db)):
    items = db.query(Emergency).order_by(Emergency.created_at.desc()).all()
    return [to_out(e).model_dump() for e in items]


@router.get("/{eid}")
def get_emergency(eid: str, db: Session = Depends(get_db)):
    e = db.query(Emergency).filter(Emergency.id == eid).first()
    if not e:
        raise HTTPException(404, "Emergency not found")
    return to_out(e).model_dump()


@router.post("")
def create_emergency(payload: EmergencyCreate, db: Session = Depends(get_db)):
    score, level, explanation, severity, med = calculate_priority(
        payload.people_affected, payload.injured_count,
        payload.vulnerable_people, payload.immediate_danger,
    )
    eid = f"E-{db.query(Emergency).count() + 200}"
    e = Emergency(
        id=eid, disaster_type=payload.disaster_type, description=payload.description,
        latitude=payload.latitude, longitude=payload.longitude, location_label=payload.location_label,
        people_affected=payload.people_affected, injured_count=payload.injured_count,
        vulnerable_people=payload.vulnerable_people, immediate_danger=payload.immediate_danger,
        severity=severity, medical_urgency=med, priority_score=score, priority_level=level,
        status="TRIAGED", explanation=json.dumps(explanation),
    )
    db.add(e)
    db.commit()
    return to_out(e).model_dump()


@router.patch("/{eid}/status")
def update_status(eid: str, payload: EmergencyUpdate, db: Session = Depends(get_db)):
    e = db.query(Emergency).filter(Emergency.id == eid).first()
    if not e:
        raise HTTPException(404, "Emergency not found")
    if payload.status:
        e.status = payload.status.upper()
        # Also update assignment if exists
        a = db.query(ResponseAssignment).filter(ResponseAssignment.emergency_id == eid).first()
        if a:
            a.status = payload.status.upper()
    e.updated_at = datetime.now(timezone.utc)
    db.commit()
    return to_out(e).model_dump()
