import os
import uuid

import aiofiles
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from core.config import settings
from core.database import get_db
from core.dependencies import get_current_operator
from models.evidence import Evidence
from schemas.evidence import EvidenceOut, EvidenceUpdate

router = APIRouter(tags=["evidence"])

BLOCKED_EXTENSIONS = {".exe", ".sh", ".bat", ".cmd", ".ps1", ".py", ".js", ".php", ".rb"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


def _detect_file_type(filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    if ext in {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"}:
        return "image"
    if ext in {".xml"}:
        return "xml"
    if ext in {".txt", ".log", ".csv", ".md", ".json"}:
        return "text"
    return "other"


def _next_display_id(db: Session, engagement_id: str) -> str:
    count = db.query(func.count(Evidence.id)).filter(Evidence.engagement_id == engagement_id).scalar()
    return f"EV-{(count + 1):04d}"


@router.post("/api/engagements/{eng_id}/evidence", response_model=EvidenceOut, status_code=201)
async def upload_evidence(
    eng_id: str,
    file: UploadFile = File(...),
    label: str | None = Form(None),
    description: str | None = Form(None),
    oplog_entry_id: str | None = Form(None),
    finding_id: str | None = Form(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_operator),
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext in BLOCKED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed")

    storage_dir = os.path.join(settings.EVIDENCE_STORAGE_PATH, eng_id)
    os.makedirs(storage_dir, exist_ok=True)

    unique_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(storage_dir, unique_name)

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 50MB limit")

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    display_id = _next_display_id(db, eng_id)
    ev = Evidence(
        engagement_id=eng_id,
        oplog_entry_id=oplog_entry_id,
        finding_id=finding_id,
        display_id=display_id,
        filename=file.filename,
        file_type=_detect_file_type(file.filename or ""),
        file_path=file_path,
        label=label,
        description=description,
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev


@router.get("/api/engagements/{eng_id}/evidence", response_model=list[EvidenceOut])
def list_evidence(
    eng_id: str,
    file_type: str | None = Query(None),
    label: str | None = Query(None),
    linked: bool | None = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_operator),
):
    q = db.query(Evidence).filter(Evidence.engagement_id == eng_id)
    if file_type:
        q = q.filter(Evidence.file_type == file_type)
    if label:
        q = q.filter(Evidence.label == label)
    if linked is True:
        q = q.filter((Evidence.oplog_entry_id != None) | (Evidence.finding_id != None))
    if linked is False:
        q = q.filter(Evidence.oplog_entry_id == None, Evidence.finding_id == None)
    return q.order_by(Evidence.uploaded_at.desc()).all()


@router.put("/api/evidence/{ev_id}", response_model=EvidenceOut)
def update_evidence(ev_id: str, body: EvidenceUpdate, db: Session = Depends(get_db), _=Depends(get_current_operator)):
    ev = db.query(Evidence).filter(Evidence.id == ev_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(ev, field, value)
    db.commit()
    db.refresh(ev)
    return ev


@router.delete("/api/evidence/{ev_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_evidence(ev_id: str, db: Session = Depends(get_db), _=Depends(get_current_operator)):
    ev = db.query(Evidence).filter(Evidence.id == ev_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found")
    if os.path.exists(ev.file_path):
        os.remove(ev.file_path)
    db.delete(ev)
    db.commit()


@router.get("/api/evidence/{ev_id}/file")
def download_evidence(ev_id: str, db: Session = Depends(get_db), _=Depends(get_current_operator)):
    ev = db.query(Evidence).filter(Evidence.id == ev_id).first()
    if not ev or not os.path.exists(ev.file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(ev.file_path, filename=ev.filename)
