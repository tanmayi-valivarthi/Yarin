"""
Dynamic replanning engine — handles events and recalculates assignments.
"""
import json
from backend.models import Road, Resource, Emergency, ResponseAssignment
from backend.decision_engines.allocation import recommend_resource, haversine_km


def trigger_road_blocked(db, road_id: str) -> dict:
    road = db.query(Road).filter(Road.id == road_id).first()
    if not road:
        return {"replanned": False, "error": "Road not found"}

    road.status = "BLOCKED"
    road.accessibility = "BLOCKED"
    db.commit()

    # Find assignments whose route uses this road
    assignments = db.query(ResponseAssignment).filter(ResponseAssignment.status.in_(["ASSIGNED", "ACCEPTED", "EN_ROUTE"])).all()
    changes = []

    for assignment in assignments:
        if road_id in (assignment.route_label or ""):
            emergency = db.query(Emergency).filter(Emergency.id == assignment.emergency_id).first()
            if not emergency:
                continue

            # Free old resource
            old_resource = db.query(Resource).filter(Resource.id == assignment.resource_id).first()
            if old_resource:
                old_resource.status = "UNAVAILABLE"
                old_resource.current_assignment = None

            # Find new resource
            all_resources = db.query(Resource).filter(Resource.status == "AVAILABLE").all()
            rec = recommend_resource(emergency, all_resources)

            if rec:
                new_resource = db.query(Resource).filter(Resource.id == rec["recommended_resource"]["id"]).first()
                if new_resource:
                    new_resource.status = "ASSIGNED"
                    new_resource.current_assignment = emergency.id
                    new_resource.eta_minutes = rec["eta_minutes"]

                    old_eta = assignment.eta_minutes
                    assignment.resource_id = new_resource.id
                    assignment.route_label = f"Alternate route (via Road R09)"
                    assignment.eta_minutes = rec["eta_minutes"]
                    assignment.assignment_reason = json.dumps(rec["reason"])
                    db.commit()

                    emergency.assigned_resource_id = new_resource.id
                    emergency.eta_minutes = rec["eta_minutes"]
                    db.commit()

                    changes.append({
                        "assignment_id": assignment.id,
                        "emergency_id": emergency.id,
                        "old_resource": old_resource.id if old_resource else None,
                        "new_resource": new_resource.id,
                        "old_eta": old_eta,
                        "new_eta": rec["eta_minutes"],
                        "reason": f"Road {road_id} became inaccessible",
                    })

    return {"replanned": len(changes) > 0, "affected_assignments": [c["assignment_id"] for c in changes], "changes": changes}


def trigger_resource_unavailable(db, resource_id: str) -> dict:
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        return {"replanned": False, "error": "Resource not found"}

    resource.status = "UNAVAILABLE"
    db.commit()

    # Find affected assignment
    assignments = db.query(ResponseAssignment).filter(
        ResponseAssignment.resource_id == resource_id,
        ResponseAssignment.status.in_(["ASSIGNED", "ACCEPTED", "EN_ROUTE"]),
    ).all()

    changes = []
    for assignment in assignments:
        emergency = db.query(Emergency).filter(Emergency.id == assignment.emergency_id).first()
        if not emergency:
            continue
        all_resources = db.query(Resource).filter(Resource.status == "AVAILABLE").all()
        rec = recommend_resource(emergency, all_resources)
        if rec:
            new_r = db.query(Resource).filter(Resource.id == rec["recommended_resource"]["id"]).first()
            if new_r:
                new_r.status = "ASSIGNED"
                new_r.current_assignment = emergency.id
                new_r.eta_minutes = rec["eta_minutes"]
                assignment.resource_id = new_r.id
                assignment.eta_minutes = rec["eta_minutes"]
                assignment.route_label = "Recalculated route"
                db.commit()
                emergency.assigned_resource_id = new_r.id
                emergency.eta_minutes = rec["eta_minutes"]
                db.commit()
                changes.append({
                    "assignment_id": assignment.id,
                    "emergency_id": emergency.id,
                    "old_resource": resource_id,
                    "new_resource": new_r.id,
                    "old_eta": assignment.eta_minutes,
                    "new_eta": rec["eta_minutes"],
                    "reason": f"Resource {resource_id} became unavailable",
                })

    return {"replanned": len(changes) > 0, "affected_assignments": [c["assignment_id"] for c in changes], "changes": changes}


def trigger_hazard_expand(db, hazard_id: str) -> dict:
    from backend.models import HazardZone
    hz = db.query(HazardZone).filter(HazardZone.id == hazard_id).first()
    if not hz:
        return {"replanned": False, "error": "Hazard zone not found"}
    hz.radius_meters = int(hz.radius_meters * 1.4)
    hz.severity = "high"
    db.commit()
    return {"replanned": True, "affected_assignments": [], "changes": [{"hazard_id": hazard_id, "new_radius": hz.radius_meters, "reason": "Hazard zone expanded"}]}


def trigger_shelter_full(db, shelter_id: str) -> dict:
    from backend.models import Shelter
    s = db.query(Shelter).filter(Shelter.id == shelter_id).first()
    if not s:
        return {"replanned": False, "error": "Shelter not found"}
    s.incoming_evacuees = s.incoming_evacuees + 20
    if s.current_occupancy + s.incoming_evacuees >= s.capacity:
        s.status = "FULL"
    db.commit()
    return {"replanned": True, "affected_assignments": [], "changes": [{"shelter_id": shelter_id, "reason": "Shelter nearing capacity, redirect recommended"}]}


def trigger_hospital_capacity(db, hospital_id: str) -> dict:
    from backend.models import Hospital
    h = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not h:
        return {"replanned": False, "error": "Hospital not found"}
    h.incoming_patients = h.incoming_patients + 4
    if h.available_beds == 0:
        h.status = "FULL"
    db.commit()
    return {"replanned": True, "affected_assignments": [], "changes": [{"hospital_id": hospital_id, "reason": "Hospital capacity changed"}]}
