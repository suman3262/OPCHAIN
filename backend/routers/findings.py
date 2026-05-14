from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from core.database import get_db
from core.dependencies import get_current_operator
from models.engagement import Engagement
from models.finding import EngagementFinding, FindingTemplate
from schemas.finding import (
    EngagementFindingCreate,
    EngagementFindingOut,
    EngagementFindingUpdate,
    FindingTemplateCreate,
    FindingTemplateOut,
    FindingTemplateUpdate,
)

router = APIRouter(tags=["findings"])


# ── Library ──────────────────────────────────────────────────────────────────

@router.get("/api/findings", response_model=list[FindingTemplateOut])
def list_library(
    search: str | None = Query(None),
    severity: str | None = Query(None),
    tag: str | None = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_operator),
):
    q = db.query(FindingTemplate)
    if severity:
        q = q.filter(FindingTemplate.severity == severity)
    if search:
        like = f"%{search}%"
        q = q.filter(FindingTemplate.title.ilike(like) | FindingTemplate.description.ilike(like))
    results = q.order_by(FindingTemplate.title).all()
    if tag:
        results = [f for f in results if tag in (f.tags or [])]
    return results


@router.post("/api/findings", response_model=FindingTemplateOut, status_code=201)
def create_library_finding(body: FindingTemplateCreate, db: Session = Depends(get_db), _=Depends(get_current_operator)):
    ft = FindingTemplate(**body.model_dump(), is_custom=True)
    db.add(ft)
    db.commit()
    db.refresh(ft)
    return ft


@router.put("/api/findings/{fid}", response_model=FindingTemplateOut)
def update_library_finding(fid: str, body: FindingTemplateUpdate, db: Session = Depends(get_db), _=Depends(get_current_operator)):
    ft = db.query(FindingTemplate).filter(FindingTemplate.id == fid).first()
    if not ft:
        raise HTTPException(status_code=404, detail="Finding not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(ft, field, value)
    db.commit()
    db.refresh(ft)
    return ft


@router.delete("/api/findings/{fid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_library_finding(fid: str, db: Session = Depends(get_db), _=Depends(get_current_operator)):
    ft = db.query(FindingTemplate).filter(FindingTemplate.id == fid).first()
    if not ft:
        raise HTTPException(status_code=404, detail="Finding not found")
    in_use = db.query(EngagementFinding).filter(EngagementFinding.template_id == fid).count()
    if in_use:
        raise HTTPException(status_code=400, detail="Finding is referenced by engagements")
    db.delete(ft)
    db.commit()


# ── Engagement Findings ───────────────────────────────────────────────────────

@router.get("/api/engagements/{eng_id}/findings", response_model=list[EngagementFindingOut])
def list_eng_findings(eng_id: str, db: Session = Depends(get_db), _=Depends(get_current_operator)):
    return db.query(EngagementFinding).filter(EngagementFinding.engagement_id == eng_id).all()


@router.post("/api/engagements/{eng_id}/findings", response_model=EngagementFindingOut, status_code=201)
def add_finding_to_engagement(
    eng_id: str,
    body: EngagementFindingCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_operator),
):
    eng = db.query(Engagement).filter(Engagement.id == eng_id).first()
    if not eng:
        raise HTTPException(status_code=404, detail="Engagement not found")

    if body.template_id:
        tmpl = db.query(FindingTemplate).filter(FindingTemplate.id == body.template_id).first()
        if not tmpl:
            raise HTTPException(status_code=404, detail="Finding template not found")
        ef = EngagementFinding(
            engagement_id=eng_id,
            template_id=tmpl.id,
            title=body.title or tmpl.title,
            severity=body.severity or tmpl.severity,
            cvss_score=body.cvss_score if body.cvss_score is not None else tmpl.cvss_score,
            cvss_vector=body.cvss_vector or tmpl.cvss_vector,
            description=body.description or tmpl.description,
            impact=body.impact or tmpl.impact,
            remediation=body.remediation or tmpl.remediation,
            references=body.references or tmpl.references,
            mitre_techniques=body.mitre_techniques or tmpl.mitre_techniques,
            cwe_id=body.cwe_id or tmpl.cwe_id,
        )
    else:
        if not body.title or not body.severity:
            raise HTTPException(status_code=400, detail="title and severity required for standalone finding")
        ef = EngagementFinding(engagement_id=eng_id, **body.model_dump(exclude={"template_id"}))

    db.add(ef)
    db.commit()
    db.refresh(ef)
    return ef


@router.put("/api/engagements/{eng_id}/findings/{fid}", response_model=EngagementFindingOut)
def update_eng_finding(
    eng_id: str, fid: str, body: EngagementFindingUpdate,
    db: Session = Depends(get_db), _=Depends(get_current_operator),
):
    ef = db.query(EngagementFinding).filter(EngagementFinding.id == fid, EngagementFinding.engagement_id == eng_id).first()
    if not ef:
        raise HTTPException(status_code=404, detail="Finding not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(ef, field, value)
    db.commit()
    db.refresh(ef)
    return ef


@router.delete("/api/engagements/{eng_id}/findings/{fid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_eng_finding(eng_id: str, fid: str, db: Session = Depends(get_db), _=Depends(get_current_operator)):
    ef = db.query(EngagementFinding).filter(EngagementFinding.id == fid, EngagementFinding.engagement_id == eng_id).first()
    if not ef:
        raise HTTPException(status_code=404, detail="Finding not found")
    db.delete(ef)
    db.commit()
