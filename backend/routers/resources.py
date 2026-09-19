from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Resource

router = APIRouter(prefix="/resources", tags=["resources"])


@router.get("")
def list_resources(db: Session = Depends(get_db)):
    items = db.query(Resource).all()
    return [
        {
            "id": r.id, "name": r.name, "type": r.type,
            "latitude": r.latitude, "longitude": r.longitude,
            "capacity": r.capacity, "status": r.status.lower().replace("_", " "),
            "assigned_to": r.current_assignment, "eta_minutes": r.eta_minutes,
            "distance_km": r.distance_km,
        }
        for r in items
    ]
