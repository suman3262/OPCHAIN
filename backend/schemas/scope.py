from typing import Literal

from pydantic import BaseModel


class ScopeItemCreate(BaseModel):
    value: str
    type: Literal["in_scope", "out_of_scope"]
    notes: str | None = None


class ScopeItemBulkCreate(BaseModel):
    items: list[ScopeItemCreate]


class ScopeItemOut(BaseModel):
    id: str
    engagement_id: str
    value: str
    type: str
    notes: str | None

    model_config = {"from_attributes": True}


class ScopeCheckRequest(BaseModel):
    engagement_id: str
    target: str


class ScopeCheckResult(BaseModel):
    target: str
    status: Literal["in_scope", "out_of_scope", "unknown"]
    matched_rule: str | None = None
