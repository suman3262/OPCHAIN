from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from core.dependencies import get_current_operator
from models.engagement import Engagement
from models.scope import ScopeItem
from schemas.scope import ScopeCheckRequest, ScopeCheckResult, ScopeItemBulkCreate, ScopeItemOut
from services.scope_checker import check_target

router = APIRouter(tags=["scope"])


@router.get("/api/engagements/{eng_id}/scope", response_model=list[ScopeItemOut])
def list_scope(eng_id: str, db: Session = Depends(get_db), _=Depends(get_current_operator)):
    return db.query(ScopeItem).filter(ScopeItem.engagement_id == eng_id).all()


@router.post("/api/engagements/{eng_id}/scope", response_model=list[ScopeItemOut], status_code=201)
def add_scope(eng_id: str, body: ScopeItemBulkCreate, db: Session = Depends(get_db), _=Depends(get_current_operator)):
    eng = db.query(Engagement).filter(Engagement.id == eng_id).first()
    if not eng:
        raise HTTPException(status_code=404, detail="Engagement not found")
    created = []
    for item in body.items:
        si = ScopeItem(engagement_id=eng_id, **item.model_dump())
        db.add(si)
        created.append(si)
    db.commit()
    for si in created:
        db.refresh(si)
    return created


@router.delete("/api/scope/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scope_item(item_id: str, db: Session = Depends(get_db), _=Depends(get_current_operator)):
    item = db.query(ScopeItem).filter(ScopeItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Scope item not found")
    db.delete(item)
    db.commit()


@router.post("/api/scope/check", response_model=ScopeCheckResult)
def scope_check(body: ScopeCheckRequest, db: Session = Depends(get_db), _=Depends(get_current_operator)):
    items = db.query(ScopeItem).filter(ScopeItem.engagement_id == body.engagement_id).all()
    result = check_target(body.target, items)
    return ScopeCheckResult(target=body.target, **result)
