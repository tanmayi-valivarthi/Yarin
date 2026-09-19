from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
from backend.database import get_db
from backend.models import Emergency, Resource, ResponseAssignment
from backend.schemas import AllocationRecommendRequest, AllocationAssignRequest
from backend.decision_engines.allocation import recommend_resource
from datetime import datetime, timezone

router = APIRouter(prefix="/allocations", tags=["allocations"])


@router.post("/recommend")
def recommend(payload: AllocationRecommendRequest, db: Session = Depends(get_db)):
    e = db.query(Emergency).filter(Emergency.id == payload.emergency_id).first()
    if not e:
        raise HTTPException(404, "Emergency not found")
    resources = db.query(Resource).filter(Resource.status == "AVAILABLE").all()
    rec = recommend_resource(e, resources)
    if not rec:
        return {"recommended_resource": None, "eta_minutes": None, "reason": ["No available resources found"]}
    return rec


@router.post("/assign")
def assign(payload: AllocationAssignRequest, db: Session = Depends(get_db)):
    e = db.query(Emergency).filter(Emergency.id == payload.emergency_id).first()
    if not e:
        raise HTTPException(404, "Emergency not found")
    r = db.query(Resource).filter(Resource.id == payload.resource_id).first()
    if not r:
        raise HTTPException(404, "Resource not found")

    r.status = "ASSIGNED"
    r.current_assignment = e.id
    e.assigned_resource_id = r.id
    e.status = "RESOURCE_ASSIGNED"

    # Recompute ETA
    resources = [r]
    rec = recommend_resource(e, resources)
    eta = rec["eta_minutes"] if rec else 10
    e.eta_minutes = eta
    r.eta_minutes = eta

    aid = f"A-{db.query(ResponseAssignment).count() + 20}"
    assignment = ResponseAssignment(
        id=aid, emergency_id=e.id, resource_id=r.id,
        route_label="Primary route", eta_minutes=eta, status="ASSIGNED",
        assignment_reason=json.dumps(rec["reason"] if rec else []),
    )
    db.add(assignment)
    e.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {
        "assignment_id": aid,
        "emergency_id": e.id,
        "resource_id": r.id,
        "eta_minutes": eta,
        "status": "ASSIGNED",
    }


@router.patch("/{aid}/status")
def update_assignment_status(aid: str, status: str, db: Session = Depends(get_db)):
    a = db.query(ResponseAssignment).filter(ResponseAssignment.id == aid).first()
    if not a:
        raise HTTPException(404, "Assignment not found")
    a.status = status.upper()
    a.updated_at = datetime.now(timezone.utc)
    # Also update emergency status
    e = db.query(Emergency).filter(Emergency.id == a.emergency_id).first()
    if e:
        e.status = status.upper()
        e.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"assignment_id": a.id, "status": a.status}
