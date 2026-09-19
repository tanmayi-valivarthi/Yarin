# RESQNET

Intelligent Disaster Response & Relief Coordination platform.

## Architecture

```
React Frontend (Vite + TypeScript + Tailwind)
        ↓ REST API + WebSocket
FastAPI Backend (Python)
        ↓
Decision Engines (Triage, Allocation, Replanning)
        ↓
SQLite Database
```

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The server starts at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

### Frontend

```bash
npm install
npm run dev
```

The frontend starts at `http://localhost:5173`.

## Environment Variables

Copy `.env.example` to `.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

## API Endpoints

### Emergencies
- `POST /api/emergencies` — Submit emergency (triggers AI-assisted triage)
- `GET /api/emergencies` — List all emergencies
- `GET /api/emergencies/{id}` — Get emergency details
- `PATCH /api/emergencies/{id}/status` — Update emergency status

### Allocations
- `POST /api/allocations/recommend` — Get AI-assisted resource recommendation
- `POST /api/allocations/assign` — Assign resource to emergency
- `PATCH /api/allocations/{id}/status` — Update assignment status

### Map
- `GET /api/map/emergencies` — Emergency markers
- `GET /api/map/resources` — Resource markers
- `GET /api/map/hospitals` — Hospital markers
- `GET /api/map/shelters` — Shelter markers
- `GET /api/map/roads` — Road paths (with blocked status)
- `GET /api/map/hazards` — Hazard zones

### Hospitals
- `GET /api/hospitals` — List hospitals
- `PATCH /api/hospitals/{id}/capacity` — Update capacity

### Shelters
- `GET /api/shelters` — List shelters
- `PATCH /api/shelters/{id}/occupancy` — Update occupancy

### Missing Persons
- `POST /api/missing-persons` — Register missing person
- `GET /api/missing-persons` — List missing persons
- `POST /api/missing-persons/{id}/potential-matches` — Mark potential match
- `POST /api/missing-persons/{id}/verify-match` — Confirm match

### Dynamic Replanning
- `POST /api/replanning/trigger` — Trigger replanning event

### Demo Simulation
- `POST /api/demo/new-emergency`
- `POST /api/demo/block-road`
- `POST /api/demo/resource-unavailable`
- `POST /api/demo/shelter-full`
- `POST /api/demo/hospital-full`
- `POST /api/demo/expand-hazard`

### Offline Sync
- `POST /api/sync/emergencies` — Batch sync queued offline reports

### WebSocket
- `ws://localhost:8000/ws` — Real-time event stream

## Decision Engines

### Triage (`backend/decision_engines/triage.py`)
Weighted scoring: immediate danger (35pts), medical emergency (30pts), vulnerable person (15pts), people affected (5-15pts), waiting time (up to 15pts). Returns score, priority level, and explanation.

### Allocation (`backend/decision_engines/allocation.py`)
Recommends nearest available resource by computing haversine distance, estimated ETA, and capacity fit.

### Replanning (`backend/decision_engines/replanning.py`)
Handles ROAD_BLOCKED, RESOURCE_UNAVAILABLE, HAZARD_ZONE_EXPANDED, SHELTER_FULL, HOSPITAL_CAPACITY_CHANGE. Finds affected assignments, recalculates routes, reassigns resources, and broadcasts WebSocket updates.
