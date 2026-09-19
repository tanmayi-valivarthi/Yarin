from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
from datetime import datetime, timezone
from backend.database import get_db
from backend.models import MissingPerson
from backend.schemas import MissingPersonCreate, PotentialMatchRequest

router = APIRouter(prefix="/missing-persons", tags=["missing-persons"])


@router.get("")
def list_missing(db: Session = Depends(get_db)):
    items = db.query(MissingPerson).all()
    return [
        {
            "id": p.id, "name": p.name, "age": p.approximate_age, "gender": p.gender,
            "last_location": p.last_known_location, "description": p.description,
            "contact": p.contact_info, "status": p.status.lower().replace("_", " "),
            "possible_match_at": p.found_at, "match_reasons": json.loads(p.match_reasons) if p.match_reasons else [],
            "reported_at": p.created_at.isoformat() if p.created_at else "",
        }
        for p in items
    ]


@router.post("")
def create_missing(payload: MissingPersonCreate, db: Session = Depends(get_db)):
    pid = f"MP-{db.query(MissingPerson).count() + 100}"
    p = MissingPerson(
        id=pid, name=payload.name, approximate_age=payload.approximate_age,
        gender=payload.gender, last_known_location=payload.last_known_location,
        description=payload.description, photo_url=payload.photo_url,
        contact_info=payload.contact_info, status="MISSING",
        match_reasons="[]",
    )
    db.add(p)
    db.commit()
    return {
        "id": p.id, "name": p.name, "status": p.status.lower(),
        "reported_at": p.created_at.isoformat() if p.created_at else "",
    }


@router.post("/{pid}/potential-matches")
def potential_match(pid: str, payload: PotentialMatchRequest, db: Session = Depends(get_db)):
    p = db.query(MissingPerson).filter(MissingPerson.id == pid).first()
    if not p:
        raise HTTPException(404, "Missing person not found")
    p.status = "POTENTIAL_MATCH"
    p.found_at = payload.found_at
    p.match_reasons = json.dumps(payload.reasons)
    db.commit()
    return {
        "id": p.id, "status": "POTENTIAL MATCH — REQUIRES HUMAN VERIFICATION",
        "found_at": p.found_at, "match_reasons": payload.reasons,
    }


@router.post("/{pid}/verify-match")
def verify_match(pid: str, db: Session = Depends(get_db)):
    p = db.query(MissingPerson).filter(MissingPerson.id == pid).first()
    if not p:
        raise HTTPException(404, "Missing person not found")
    p.status = "FOUND"
    db.commit()
    return {"id": p.id, "status": "FOUND", "message": "Match confirmed by authorized personnel."}
