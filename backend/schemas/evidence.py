from datetime import datetime

from pydantic import BaseModel


class EvidenceOut(BaseModel):
    id: str
    engagement_id: str
    oplog_entry_id: str | None
    finding_id: str | None
    display_id: str | None
    filename: str
    file_type: str
    label: str | None
    description: str | None
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class EvidenceUpdate(BaseModel):
    label: str | None = None
    description: str | None = None
    oplog_entry_id: str | None = None
    finding_id: str | None = None
