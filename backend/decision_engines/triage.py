"""
Transparent weighted scoring for emergency prioritization.
Not arbitrary — each factor contributes a known weight.
"""

from backend.models import Emergency


def calculate_priority(
    people_affected: int,
    injured_count: int,
    vulnerable_people: bool,
    immediate_danger: bool,
    waiting_minutes: float = 0,
) -> tuple[int, str, list[str], str, str]:
    score = 0
    explanation: list[str] = []

    if immediate_danger:
        score += 35
        explanation.append("Immediate danger reported")
    if injured_count > 0:
        score += 30
        explanation.append("Medical emergency reported")
    if vulnerable_people:
        score += 15
        explanation.append("Vulnerable person present")
    if people_affected >= 10:
        score += 15
        explanation.append(f"Large group affected ({people_affected} people)")
    elif people_affected >= 4:
        score += 10
        explanation.append(f"Multiple people affected ({people_affected})")
    else:
        score += 5

    # Waiting time factor (up to 15 points)
    wait_score = min(int(waiting_minutes / 2), 15)
    score += wait_score
    if wait_score > 0:
        explanation.append(f"Waiting time: {int(waiting_minutes)} min")

    score = min(score, 100)

    if score >= 75:
        level = "CRITICAL"
    elif score >= 50:
        level = "HIGH"
    elif score >= 25:
        level = "MEDIUM"
    else:
        level = "LOW"

    severity = "critical" if score >= 75 else "high" if score >= 50 else "medium" if score >= 25 else "low"
    medical_urgency = "high" if injured_count > 0 else "low"

    return score, level, explanation, severity, medical_urgency


def retriage(emergency: Emergency, db_session) -> None:
    from datetime import datetime, timezone
    waiting = (datetime.now(timezone.utc) - emergency.created_at).total_seconds() / 60
    score, level, explanation, severity, med = calculate_priority(
        emergency.people_affected,
        emergency.injured_count,
        emergency.vulnerable_people,
        emergency.immediate_danger,
        waiting,
    )
    import json
    emergency.priority_score = score
    emergency.priority_level = level
    emergency.severity = severity
    emergency.medical_urgency = med
    emergency.explanation = json.dumps(explanation)
