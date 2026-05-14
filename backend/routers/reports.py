from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from core.database import get_db
from core.dependencies import get_current_operator
from models.engagement import Engagement
from services.report_generator import generate_markdown

router = APIRouter(prefix="/api/engagements", tags=["reports"])


@router.get("/{eng_id}/report/md", response_class=PlainTextResponse)
def download_markdown_report(
    eng_id: str,
    external_safe: bool = Query(False),
    db: Session = Depends(get_db),
    _=Depends(get_current_operator),
):
    eng = db.query(Engagement).filter(Engagement.id == eng_id).first()
    if not eng:
        raise HTTPException(status_code=404, detail="Engagement not found")
    content = generate_markdown(eng, db, external_safe=external_safe)
    filename = f"{eng.name.replace(' ', '_')}_report.md"
    return PlainTextResponse(
        content=content,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
