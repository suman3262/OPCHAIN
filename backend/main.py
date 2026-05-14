import json
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from core.config import settings
from core.database import Base, SessionLocal, engine
from core.security import hash_password
from models import *  # noqa: F401, F403 — ensures all models registered for table creation
from routers import auth, engagements, evidence, findings, mitre, oplog, operators, reports, scope

app = FastAPI(
    title="OPCHAIN",
    description="Pentest & Red Team Operations Center",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(operators.router)
app.include_router(engagements.router)
app.include_router(scope.router)
app.include_router(oplog.router)
app.include_router(evidence.router)
app.include_router(findings.router)
app.include_router(mitre.router)
app.include_router(reports.router)


def _seed_admin(db):
    from models.operator import Operator
    if db.query(Operator).count() == 0:
        admin = Operator(
            username="admin",
            display_name="Administrator",
            password_hash=hash_password(settings.FIRST_RUN_ADMIN_PASSWORD),
            role="admin",
        )
        db.add(admin)
        db.commit()
        print(f"[OPCHAIN] Created admin account with password from FIRST_RUN_ADMIN_PASSWORD")


def _seed_mitre(db):
    from models.mitre import MITRETechnique
    if db.query(MITRETechnique).count() > 0:
        return
    data_path = os.path.join(os.path.dirname(__file__), "seed_data", "mitre_techniques.json")
    if not os.path.exists(data_path):
        print("[OPCHAIN] MITRE data file not found, skipping seed")
        return
    with open(data_path) as f:
        techniques = json.load(f)
    for t in techniques:
        db.add(MITRETechnique(
            id=t["id"],
            name=t["name"],
            tactic=t.get("tactic", ""),
            description=t.get("description", ""),
            url=t.get("url", ""),
        ))
    db.commit()
    print(f"[OPCHAIN] Seeded {len(techniques)} MITRE ATT&CK techniques")


def _seed_findings(db):
    from models.finding import FindingTemplate
    if db.query(FindingTemplate).count() > 0:
        return
    data_path = os.path.join(os.path.dirname(__file__), "seed_data", "default_findings.json")
    if not os.path.exists(data_path):
        print("[OPCHAIN] Findings data file not found, skipping seed")
        return
    with open(data_path) as f:
        findings_data = json.load(f)
    for fd in findings_data:
        db.add(FindingTemplate(
            title=fd["title"],
            severity=fd["severity"],
            cvss_score=fd.get("cvss_score"),
            cvss_vector=fd.get("cvss_vector"),
            description=fd.get("description"),
            impact=fd.get("impact"),
            remediation=fd.get("remediation"),
            references=fd.get("references", []),
            mitre_techniques=fd.get("mitre_techniques", []),
            cwe_id=fd.get("cwe_id"),
            tags=fd.get("tags", []),
            is_custom=False,
        ))
    db.commit()
    print(f"[OPCHAIN] Seeded {len(findings_data)} default findings")


def _ensure_storage():
    os.makedirs(settings.EVIDENCE_STORAGE_PATH, exist_ok=True)


@app.on_event("startup")
def on_startup():
    _ensure_storage()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _seed_admin(db)
        _seed_mitre(db)
        _seed_findings(db)
    finally:
        db.close()

    # Serve built frontend if it exists
    # Try both: Docker path (./frontend/dist) and dev path (../frontend/dist)
    _docker_dist = os.path.join(os.path.dirname(__file__), "frontend", "dist")
    _dev_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
    frontend_dist = _docker_dist if os.path.exists(_docker_dist) else _dev_dist
    if os.path.exists(frontend_dist):
        app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
        print(f"[OPCHAIN] Serving frontend from {frontend_dist}")
    else:
        print("[OPCHAIN] No frontend/dist found — API-only mode")


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
