from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Road, Resource
from backend.decision_engines.replanning import (
    trigger_road_blocked, trigger_resource_unavailable,
    trigger_hazard_expand, trigger_shelter_full, trigger_hospital_capacity,
)
from backend.schemas import ReplanningTriggerRequest

router = APIRouter(prefix="/replanning", tags=["replanning"])

# This will be set by main.py so we can broadcast WS events
_broadcast = None


def set_broadcast(fn):
    global _broadcast
    _broadcast = fn


@router.post("/trigger")
def trigger_replanning(payload: ReplanningTriggerRequest, db: Session = Depends(get_db)):
    event = payload.event_type.upper()
    eid = payload.entity_id

    if event == "ROAD_BLOCKED":
        result = trigger_road_blocked(db, eid)
    elif event == "RESOURCE_UNAVAILABLE":
        result = trigger_resource_unavailable(db, eid)
    elif event == "HAZARD_ZONE_EXPANDED":
        result = trigger_hazard_expand(db, eid)
    elif event == "SHELTER_FULL":
        result = trigger_shelter_full(db, eid)
    elif event == "HOSPITAL_CAPACITY_CHANGE":
        result = trigger_hospital_capacity(db, eid)
    else:
        return {"replanned": False, "error": f"Unknown event type: {event}"}

    # Broadcast via WebSocket
    if _broadcast and result.get("replanned"):
        _broadcast({
            "type": "REPLANNING",
            "event": event,
            "result": result,
        })

    return result
