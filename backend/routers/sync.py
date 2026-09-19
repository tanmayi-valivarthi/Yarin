from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json
from backend.database import get_db
from backend.models import Emergency
from backend.schemas import EmergencyCreate
from backend.decision_engines.triage import calculate_priority

router = APIRouter(prefix="/sync", tags=["sync"])


@router.post("/emergencies")
def sync_emergencies(reports: list[EmergencyCreate], db: Session = Depends(get_db)):
    results = []
    for payload in reports:
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
        results.append({"id": eid, "priority_level": level, "status": "SYNCED"})
    db.commit()
    return {"synced": len(results), "results": results}
