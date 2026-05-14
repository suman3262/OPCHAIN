from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from core.dependencies import get_current_operator
from models.engagement import Engagement
from models.operator import Operator
from schemas.engagement import EngagementCreate, EngagementOut, EngagementUpdate

router = APIRouter(prefix="/api/engagements", tags=["engagements"])


@router.get("", response_model=list[EngagementOut])
def list_engagements(db: Session = Depends(get_db), _=Depends(get_current_operator)):
    return db.query(Engagement).filter(Engagement.status != "Archived").order_by(Engagement.created_at.desc()).all()


@router.post("", response_model=EngagementOut, status_code=status.HTTP_201_CREATED)
def create_engagement(
    body: EngagementCreate,
    db: Session = Depends(get_db),
    current: Operator = Depends(get_current_operator),
):
    eng = Engagement(**body.model_dump())
    eng.operators.append(current)
    db.add(eng)
    db.commit()
    db.refresh(eng)
    return eng


@router.get("/{eng_id}", response_model=EngagementOut)
def get_engagement(eng_id: str, db: Session = Depends(get_db), _=Depends(get_current_operator)):
    eng = db.query(Engagement).filter(Engagement.id == eng_id).first()
    if not eng:
        raise HTTPException(status_code=404, detail="Engagement not found")
    return eng


@router.put("/{eng_id}", response_model=EngagementOut)
def update_engagement(
    eng_id: str,
    body: EngagementUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_operator),
):
    eng = db.query(Engagement).filter(Engagement.id == eng_id).first()
    if not eng:
        raise HTTPException(status_code=404, detail="Engagement not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(eng, field, value)
    eng.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(eng)
    return eng


@router.delete("/{eng_id}", status_code=status.HTTP_204_NO_CONTENT)
def archive_engagement(eng_id: str, db: Session = Depends(get_db), _=Depends(get_current_operator)):
    eng = db.query(Engagement).filter(Engagement.id == eng_id).first()
    if not eng:
        raise HTTPException(status_code=404, detail="Engagement not found")
    eng.status = "Archived"
    eng.updated_at = datetime.now(timezone.utc)
    db.commit()


@router.post("/{eng_id}/operators/{op_id}", status_code=status.HTTP_204_NO_CONTENT)
def add_operator(eng_id: str, op_id: str, db: Session = Depends(get_db), _=Depends(get_current_operator)):
    eng = db.query(Engagement).filter(Engagement.id == eng_id).first()
    op = db.query(Operator).filter(Operator.id == op_id).first()
    if not eng or not op:
        raise HTTPException(status_code=404, detail="Not found")
    if op not in eng.operators:
        eng.operators.append(op)
        db.commit()


@router.delete("/{eng_id}/operators/{op_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_operator(eng_id: str, op_id: str, db: Session = Depends(get_db), _=Depends(get_current_operator)):
    eng = db.query(Engagement).filter(Engagement.id == eng_id).first()
    op = db.query(Operator).filter(Operator.id == op_id).first()
    if not eng or not op:
        raise HTTPException(status_code=404, detail="Not found")
    if op in eng.operators:
        eng.operators.remove(op)
        db.commit()
