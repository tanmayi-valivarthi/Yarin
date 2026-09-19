from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text
from backend.database import Base
from datetime import datetime, timezone


def _now():
    return datetime.now(timezone.utc)


class Emergency(Base):
    __tablename__ = "emergencies"
    id = Column(String, primary_key=True)
    disaster_type = Column(String, default="flood")
    description = Column(Text, default="")
    latitude = Column(Float, default=0.0)
    longitude = Column(Float, default=0.0)
    location_label = Column(String, default="")
    people_affected = Column(Integer, default=1)
    injured_count = Column(Integer, default=0)
    vulnerable_people = Column(Boolean, default=False)
    immediate_danger = Column(Boolean, default=False)
    severity = Column(String, default="medium")
    medical_urgency = Column(String, default="low")
    priority_score = Column(Integer, default=50)
    priority_level = Column(String, default="MEDIUM")
    status = Column(String, default="REPORTED")
    assigned_resource_id = Column(String, nullable=True)
    eta_minutes = Column(Integer, nullable=True)
    explanation = Column(Text, default="[]")
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)


class Resource(Base):
    __tablename__ = "resources"
    id = Column(String, primary_key=True)
    name = Column(String, default="")
    type = Column(String, default="rescue_vehicle")
    latitude = Column(Float, default=0.0)
    longitude = Column(Float, default=0.0)
    capacity = Column(Integer, default=8)
    status = Column(String, default="AVAILABLE")
    current_assignment = Column(String, nullable=True)
    eta_minutes = Column(Integer, nullable=True)
    distance_km = Column(Float, default=0.0)


class Hospital(Base):
    __tablename__ = "hospitals"
    id = Column(String, primary_key=True)
    name = Column(String, default="")
    latitude = Column(Float, default=0.0)
    longitude = Column(Float, default=0.0)
    emergency_capacity = Column(Integer, default=10)
    available_beds = Column(Integer, default=5)
    icu_capacity = Column(Integer, default=4)
    available_icu = Column(Integer, default=2)
    incoming_patients = Column(Integer, default=0)
    status = Column(String, default="AVAILABLE")


class Shelter(Base):
    __tablename__ = "shelters"
    id = Column(String, primary_key=True)
    name = Column(String, default="")
    latitude = Column(Float, default=0.0)
    longitude = Column(Float, default=0.0)
    capacity = Column(Integer, default=100)
    current_occupancy = Column(Integer, default=0)
    incoming_evacuees = Column(Integer, default=0)
    food_status = Column(String, default="OK")
    water_status = Column(String, default="OK")
    medicine_status = Column(String, default="OK")
    status = Column(String, default="AVAILABLE")


class Road(Base):
    __tablename__ = "roads"
    id = Column(String, primary_key=True)
    name = Column(String, default="")
    start_lat = Column(Float, default=0.0)
    start_lng = Column(Float, default=0.0)
    end_lat = Column(Float, default=0.0)
    end_lng = Column(Float, default=0.0)
    mid_lat = Column(Float, default=0.0)
    mid_lng = Column(Float, default=0.0)
    status = Column(String, default="ACCESSIBLE")
    accessibility = Column(String, default="CLEAR")


class HazardZone(Base):
    __tablename__ = "hazard_zones"
    id = Column(String, primary_key=True)
    name = Column(String, default="")
    disaster_type = Column(String, default="flood")
    severity = Column(String, default="medium")
    latitude = Column(Float, default=0.0)
    longitude = Column(Float, default=0.0)
    radius_meters = Column(Integer, default=500)
    status = Column(String, default="ACTIVE")


class MissingPerson(Base):
    __tablename__ = "missing_persons"
    id = Column(String, primary_key=True)
    name = Column(String, default="Unknown")
    approximate_age = Column(Integer, default=0)
    gender = Column(String, default="male")
    last_known_location = Column(String, default="")
    description = Column(Text, default="")
    photo_url = Column(String, nullable=True)
    contact_info = Column(String, default="")
    status = Column(String, default="MISSING")
    found_at = Column(String, nullable=True)
    match_reasons = Column(Text, default="[]")
    created_at = Column(DateTime, default=_now)


class ResponseAssignment(Base):
    __tablename__ = "response_assignments"
    id = Column(String, primary_key=True)
    emergency_id = Column(String, default="")
    resource_id = Column(String, default="")
    route_label = Column(String, default="")
    eta_minutes = Column(Integer, default=0)
    status = Column(String, default="ASSIGNED")
    assignment_reason = Column(Text, default="[]")
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)
