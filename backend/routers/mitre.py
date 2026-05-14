from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.dependencies import get_current_operator
from models.mitre import MITRETechnique
from schemas.mitre import MITRETechniqueOut

router = APIRouter(prefix="/api/mitre", tags=["mitre"])


@router.get("/techniques", response_model=list[MITRETechniqueOut])
def list_techniques(
    q: str | None = Query(None),
    tactic: str | None = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_operator),
):
    query = db.query(MITRETechnique)
    if tactic:
        query = query.filter(MITRETechnique.tactic == tactic)
    if q:
        like = f"%{q}%"
        query = query.filter(MITRETechnique.id.ilike(like) | MITRETechnique.name.ilike(like))
    return query.order_by(MITRETechnique.tactic, MITRETechnique.id).limit(50).all()


@router.get("/tactics")
def list_tactics(db: Session = Depends(get_db), _=Depends(get_current_operator)):
    rows = db.query(MITRETechnique.tactic).distinct().order_by(MITRETechnique.tactic).all()
    return [r[0] for r in rows]


@router.get("/techniques/{tid}", response_model=MITRETechniqueOut)
def get_technique(tid: str, db: Session = Depends(get_db), _=Depends(get_current_operator)):
    t = db.query(MITRETechnique).filter(MITRETechnique.id == tid).first()
    return t
