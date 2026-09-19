from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Hospital
from backend.schemas import HospitalCapacityUpdate

router = APIRouter(prefix="/hospitals", tags=["hospitals"])


@router.get("")
def list_hospitals(db: Session = Depends(get_db)):
    items = db.query(Hospital).all()
    return [
        {
            "id": h.id, "name": h.name, "latitude": h.latitude, "longitude": h.longitude,
            "emergency_beds": h.available_beds, "emergency_beds_total": h.emergency_capacity,
            "icu": h.available_icu, "icu_total": h.icu_capacity, "incoming": h.incoming_patients,
            "status": h.status,
        }
        for h in items
    ]


@router.patch("/{hid}/capacity")
def update_capacity(hid: str, payload: HospitalCapacityUpdate, db: Session = Depends(get_db)):
    h = db.query(Hospital).filter(Hospital.id == hid).first()
    if not h:
        raise HTTPException(404, "Hospital not found")
    if payload.available_beds is not None:
        h.available_beds = payload.available_beds
    if payload.available_icu is not None:
        h.available_icu = payload.available_icu
    if payload.incoming_patients is not None:
        h.incoming_patients = payload.incoming_patients
    if h.available_beds == 0:
        h.status = "FULL"
    else:
        h.status = "AVAILABLE"
    db.commit()
    return {
        "id": h.id, "available_beds": h.available_beds, "available_icu": h.available_icu,
        "incoming_patients": h.incoming_patients, "status": h.status,
        "capacity_alert": h.status == "FULL",
    }
