from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class EngagementCreate(BaseModel):
    name: str
    client_name: str
    start_date: datetime | None = None
    end_date: datetime | None = None
    description: str | None = None
    status: Literal["Planning", "Active", "Completed", "Archived"] = "Planning"


class EngagementUpdate(BaseModel):
    name: str | None = None
    client_name: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    description: str | None = None
    status: Literal["Planning", "Active", "Completed", "Archived"] | None = None


class EngagementOut(BaseModel):
    id: str
    name: str
    client_name: str
    start_date: datetime | None
    end_date: datetime | None
    status: str
    description: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
