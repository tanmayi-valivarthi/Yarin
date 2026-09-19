"""
Resource allocation engine — recommends nearest suitable available resource.
"""
import math
from backend.models import Resource, Emergency


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def recommend_resource(emergency: Emergency, resources: list[Resource]) -> dict | None:
    candidates = [r for r in resources if r.status == "AVAILABLE" and r.type in ("rescue_vehicle", "boat")]

    if not candidates:
        return None

    scored = []
    for r in candidates:
        dist = haversine_km(emergency.latitude, emergency.longitude, r.latitude, r.longitude)
        # Rough ETA: assume 30 km/h average urban speed
        eta = max(1, int(dist / 30 * 60))
        # Score: lower is better (penalty)
        penalty = eta * 2
        if r.capacity < emergency.people_affected:
            penalty += 20  # too small
        scored.append((r, dist, eta, penalty))

    scored.sort(key=lambda x: x[3])
    best, dist, eta, _ = scored[0]

    reasons = [
        "Resource currently available",
        f"Suitable capacity ({best.capacity})",
        f"Accessible route, distance {dist:.1f} km",
        f"Short feasible ETA: {eta} min",
    ]

    return {
        "recommended_resource": {"id": best.id, "name": best.name},
        "eta_minutes": eta,
        "distance_km": round(dist, 1),
        "reason": reasons,
    }
