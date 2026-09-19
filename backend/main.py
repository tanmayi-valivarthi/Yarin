import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.seed import seed
from backend.routers import (
    emergencies, allocations, resources, map, hospitals,
    shelters, missing_persons, replanning, demo, sync,
)

Base.metadata.create_all(engine)
seed()

app = FastAPI(title="RESQNET API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, message: dict):
        for ws in self.active:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                pass

manager = ConnectionManager()


def sync_broadcast(message: dict):
    """Synchronous wrapper for broadcast — called from sync route code.
    Schedules the async broadcast via the running event loop."""
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(manager.broadcast(message))
        else:
            loop.run_until_complete(manager.broadcast(message))
    except Exception:
        pass


# Wire broadcast to routers
replanning.set_broadcast(sync_broadcast)
demo.set_demo_broadcast(sync_broadcast)


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            data = await ws.receive_text()
            # Echo ping
            if data == "ping":
                await ws.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        manager.disconnect(ws)


# Register routers
app.include_router(emergencies.router, prefix="/api")
app.include_router(allocations.router, prefix="/api")
app.include_router(resources.router, prefix="/api")
app.include_router(map.router, prefix="/api")
app.include_router(hospitals.router, prefix="/api")
app.include_router(shelters.router, prefix="/api")
app.include_router(missing_persons.router, prefix="/api")
app.include_router(replanning.router, prefix="/api")
app.include_router(demo.router, prefix="/api")
app.include_router(sync.router, prefix="/api")


@app.get("/")
def root():
    return {"name": "RESQNET API", "status": "running", "docs": "/docs"}


@app.get("/api/health")
def health():
    return {"status": "ok"}
