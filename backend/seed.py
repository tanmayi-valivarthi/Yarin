"""Seed the SQLite database with initial data matching the frontend mock."""
import json
from backend.database import engine, SessionLocal, Base
from backend.models import (
    Emergency, Resource, Hospital, Shelter, Road, HazardZone,
    MissingPerson, ResponseAssignment,
)
from datetime import datetime, timezone

Base.metadata.create_all(engine)


def seed():
    db = SessionLocal()
    if db.query(Emergency).count() > 0:
        db.close()
        return

    now = datetime.now(timezone.utc)

    emergencies = [
        Emergency(id="E-102", disaster_type="flood",
            description="Water has entered our house. 6 people are trapped. My grandmother cannot walk and one person is injured.",
            latitude=26.915, longitude=75.78, location_label="Zone A, Riverside Area",
            people_affected=6, injured_count=1, vulnerable_people=True, immediate_danger=True,
            severity="critical", medical_urgency="high", priority_score=92, priority_level="CRITICAL",
            status="RESOURCE_ASSIGNED", assigned_resource_id="R-01", eta_minutes=6,
            explanation=json.dumps(["Immediate danger reported", "Medical emergency reported", "Vulnerable person present", "Multiple people affected (6)"]),
            created_at=now, updated_at=now),
        Emergency(id="E-101", disaster_type="flood",
            description="Flood water rising near market. 8 people stranded on rooftop.",
            latitude=26.908, longitude=75.792, location_label="Zone B, Market Road",
            people_affected=8, injured_count=0, vulnerable_people=False, immediate_danger=True,
            severity="high", medical_urgency="low", priority_score=70, priority_level="HIGH",
            status="EN_ROUTE", assigned_resource_id="B-01", eta_minutes=12,
            explanation=json.dumps(["Immediate danger reported", "Multiple people affected (8)"]),
            created_at=now, updated_at=now),
        Emergency(id="E-103", disaster_type="flood",
            description="Family of 15 trapped in two-storey house, water on ground floor.",
            latitude=26.92, longitude=75.775, location_label="Zone C, Flood Plain",
            people_affected=15, injured_count=0, vulnerable_people=True, immediate_danger=True,
            severity="high", medical_urgency="low", priority_score=80, priority_level="HIGH",
            status="REPORTED",
            explanation=json.dumps(["Immediate danger reported", "Vulnerable person present", "Large group affected (15 people)"]),
            created_at=now, updated_at=now),
        Emergency(id="E-104", disaster_type="flood",
            description="3 people, one with chest pain, stranded near bridge.",
            latitude=26.917, longitude=75.785, location_label="Zone A, Old Bridge",
            people_affected=3, injured_count=1, vulnerable_people=False, immediate_danger=True,
            severity="critical", medical_urgency="high", priority_score=85, priority_level="CRITICAL",
            status="TRIAGED",
            explanation=json.dumps(["Immediate danger reported", "Medical emergency reported"]),
            created_at=now, updated_at=now),
    ]
    db.add_all(emergencies)

    resources = [
        Resource(id="R-01", name="Rescue Vehicle R-01", type="rescue_vehicle", latitude=26.913, longitude=75.783, capacity=8, status="ASSIGNED", current_assignment="E-102", eta_minutes=6, distance_km=2.1),
        Resource(id="R-04", name="Rescue Vehicle R-04", type="rescue_vehicle", latitude=26.922, longitude=75.78, capacity=10, status="AVAILABLE", distance_km=3.4, eta_minutes=8),
        Resource(id="R-03", name="Rescue Team R-03", type="rescue_vehicle", latitude=26.909, longitude=75.79, capacity=6, status="ASSIGNED", current_assignment="E-101"),
        Resource(id="B-01", name="Boat B-01", type="boat", latitude=26.919, longitude=75.778, capacity=12, status="ASSIGNED", current_assignment="E-101"),
        Resource(id="M-03", name="Medical Team M-03", type="medical_team", latitude=26.9145, longitude=75.782, capacity=4, status="ASSIGNED", current_assignment="E-102"),
        Resource(id="A-01", name="Ambulance A-01", type="ambulance", latitude=26.91, longitude=75.77, capacity=2, status="AVAILABLE", eta_minutes=10),
    ]
    db.add_all(resources)

    hospitals = [
        Hospital(id="H-01", name="City Hospital H-01", latitude=26.91, longitude=75.77, emergency_capacity=12, available_beds=5, icu_capacity=6, available_icu=2, incoming_patients=0, status="AVAILABLE"),
        Hospital(id="H-02", name="Regional Hospital H-02", latitude=26.923, longitude=75.79, emergency_capacity=10, available_beds=0, icu_capacity=4, available_icu=1, incoming_patients=4, status="AVAILABLE"),
    ]
    db.add_all(hospitals)

    shelters = [
        Shelter(id="S-A", name="Shelter A — Community Hall", latitude=26.905, longitude=75.785, capacity=120, current_occupancy=80, incoming_evacuees=12, food_status="OK", water_status="LOW", medicine_status="OK", status="AVAILABLE"),
        Shelter(id="S-B", name="Shelter B — School Building", latitude=26.9, longitude=75.795, capacity=100, current_occupancy=95, incoming_evacuees=28, food_status="LOW", water_status="LOW", medicine_status="CRITICAL", status="AVAILABLE"),
        Shelter(id="S-C", name="Shelter C — Relief Camp", latitude=26.895, longitude=75.77, capacity=200, current_occupancy=40, incoming_evacuees=0, food_status="OK", water_status="OK", medicine_status="OK", status="AVAILABLE"),
    ]
    db.add_all(shelters)

    roads = [
        Road(id="R12", name="Road R12", start_lat=26.913, start_lng=75.783, end_lat=26.915, end_lng=75.78, mid_lat=26.9145, mid_lng=75.7815, status="ACCESSIBLE", accessibility="CLEAR"),
        Road(id="R09", name="Road R09", start_lat=26.913, start_lng=75.783, end_lat=26.922, end_lng=75.78, mid_lat=26.918, mid_lng=75.784, status="ACCESSIBLE", accessibility="CLEAR"),
        Road(id="R05", name="Market Road R05", start_lat=26.91, start_lng=75.788, end_lat=26.908, end_lng=75.792, mid_lat=26.909, mid_lng=75.79, status="ACCESSIBLE", accessibility="CLEAR"),
    ]
    db.add_all(roads)

    hazards = [
        HazardZone(id="HZ-A", name="Flood Zone A", disaster_type="flood", severity="high", latitude=26.915, longitude=75.78, radius_meters=600, status="ACTIVE"),
        HazardZone(id="HZ-C", name="Flood Zone C", disaster_type="flood", severity="medium", latitude=26.92, longitude=75.775, radius_meters=450, status="ACTIVE"),
    ]
    db.add_all(hazards)

    missing = [
        MissingPerson(id="MP-104", name="Ramesh K.", approximate_age=72, gender="male", last_known_location="Zone A, Riverside", description="Wearing white kurta, uses walking stick, grey hair.", contact_info="Family: 98xxxxxxxx", status="MISSING", created_at=now),
        MissingPerson(id="MP-105", name="Anita S.", approximate_age=34, gender="female", last_known_location="Zone B, Market", description="Red saree, carrying infant.", contact_info="Husband: 99xxxxxxxx", status="POTENTIAL_MATCH", found_at="Shelter B", match_reasons=json.dumps(["Approximate age", "Reported location", "Descriptive information"]), created_at=now),
    ]
    db.add_all(missing)

    assignments = [
        ResponseAssignment(id="A-21", emergency_id="E-102", resource_id="R-01", route_label="Road R12", eta_minutes=6, status="EN_ROUTE", assignment_reason=json.dumps(["Available", "Suitable capacity", "Accessible route", "Short feasible ETA"]), created_at=now, updated_at=now),
    ]
    db.add_all(assignments)

    db.commit()
    db.close()
