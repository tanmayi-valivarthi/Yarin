from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Shelter
from backend.schemas import ShelterOccupancyUpdate

router = APIRouter(prefix="/shelters", tags=["shelters"])


@router.get("")
def list_shelters(db: Session = Depends(get_db)):
    items = db.query(Shelter).all()
    return [
        {
            "id": s.id, "name": s.name, "latitude": s.latitude, "longitude": s.longitude,
            "occupancy": s.current_occupancy, "capacity": s.capacity,
            "available_capacity": s.capacity - s.current_occupancy,
            "incoming": s.incoming_evacuees,
            "food": s.food_status.lower(), "water": s.water_status.lower(), "medicine": s.medicine_status.lower(),
            "status": s.status,
        }
        for s in items
    ]


@router.patch("/{sid}/occupancy")
def update_occupancy(sid: str, payload: ShelterOccupancyUpdate, db: Session = Depends(get_db)):
    s = db.query(Shelter).filter(Shelter.id == sid).first()
    if not s:
        raise HTTPException(404, "Shelter not found")
    if payload.current_occupancy is not None:
        s.current_occupancy = payload.current_occupancy
    if payload.incoming_evacuees is not None:
        s.incoming_evacuees = payload.incoming_evacuees
    if s.current_occupancy + s.incoming_evacuees >= s.capacity:
        s.status = "FULL"
    else:
        s.status = "AVAILABLE"
    db.commit()
    return {
        "id": s.id, "occupancy": s.current_occupancy, "capacity": s.capacity,
        "available_capacity": s.capacity - s.current_occupancy,
        "incoming": s.incoming_evacuees, "status": s.status,
        "shelter_full": s.status == "FULL",
    }
