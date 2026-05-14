from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from core.database import get_db
from core.dependencies import get_current_operator
from models.engagement import Engagement
from models.oplog import OPLOGEntry
from models.operator import Operator
from models.scope import ScopeItem
from schemas.oplog import OPLOGEntryCreate, OPLOGEntryOut, OPLOGEntryUpdate
from services.scope_checker import check_target

router = APIRouter(tags=["oplog"])


def _entry_to_out(entry: OPLOGEntry, scope_status: str | None = None) -> dict:
    data = OPLOGEntryOut.model_validate(entry).model_dump()
    data["scope_status"] = scope_status
    return data


@router.get("/api/engagements/{eng_id}/oplog", response_model=list[OPLOGEntryOut])
def list_oplog(
    eng_id: str,
    operator_id: str | None = Query(None),
    action_type: str | None = Query(None),
    outcome: str | None = Query(None),
    mitre_technique_id: str | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_operator),
):
    q = db.query(OPLOGEntry).filter(OPLOGEntry.engagement_id == eng_id)
    if operator_id:
        q = q.filter(OPLOGEntry.operator_id == operator_id)
    if action_type:
        q = q.filter(OPLOGEntry.action_type == action_type)
    if outcome:
        q = q.filter(OPLOGEntry.outcome == outcome)
    if mitre_technique_id:
        q = q.filter(OPLOGEntry.mitre_technique_id == mitre_technique_id)
    if search:
        like = f"%{search}%"
        q = q.filter(
            OPLOGEntry.target.ilike(like)
            | OPLOGEntry.command_action.ilike(like)
            | OPLOGEntry.notes.ilike(like)
        )
    return q.order_by(OPLOGEntry.timestamp.desc()).all()


@router.post("/api/engagements/{eng_id}/oplog", response_model=OPLOGEntryOut, status_code=201)
def create_oplog(
    eng_id: str,
    body: OPLOGEntryCreate,
    db: Session = Depends(get_db),
    current: Operator = Depends(get_current_operator),
):
    eng = db.query(Engagement).filter(Engagement.id == eng_id).first()
    if not eng:
        raise HTTPException(status_code=404, detail="Engagement not found")
    entry = OPLOGEntry(engagement_id=eng_id, operator_id=current.id, **body.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)

    scope_items = db.query(ScopeItem).filter(ScopeItem.engagement_id == eng_id).all()
    scope_result = check_target(entry.target, scope_items)

    result = OPLOGEntryOut.model_validate(entry)
    result.scope_status = scope_result["status"]
    return result


@router.get("/api/oplog/{entry_id}", response_model=OPLOGEntryOut)
def get_oplog_entry(entry_id: str, db: Session = Depends(get_db), _=Depends(get_current_operator)):
    entry = db.query(OPLOGEntry).filter(OPLOGEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry


@router.put("/api/oplog/{entry_id}", response_model=OPLOGEntryOut)
def update_oplog(
    entry_id: str,
    body: OPLOGEntryUpdate,
    db: Session = Depends(get_db),
    current: Operator = Depends(get_current_operator),
):
    entry = db.query(OPLOGEntry).filter(OPLOGEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    if entry.operator_id != current.id and current.role != "admin":
        raise HTTPException(status_code=403, detail="Cannot edit another operator's entry")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/api/oplog/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_oplog(
    entry_id: str,
    db: Session = Depends(get_db),
    current: Operator = Depends(get_current_operator),
):
    entry = db.query(OPLOGEntry).filter(OPLOGEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    if entry.operator_id != current.id and current.role != "admin":
        raise HTTPException(status_code=403, detail="Cannot delete another operator's entry")
    db.delete(entry)
    db.commit()
