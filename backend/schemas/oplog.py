from datetime import datetime

from pydantic import BaseModel


class OPLOGEntryCreate(BaseModel):
    target: str
    action_type: str
    command_action: str
    outcome: str
    mitre_technique_id: str | None = None
    notes: str | None = None
    is_internal_only: bool = False


class OPLOGEntryUpdate(BaseModel):
    target: str | None = None
    action_type: str | None = None
    command_action: str | None = None
    outcome: str | None = None
    mitre_technique_id: str | None = None
    notes: str | None = None
    is_internal_only: bool | None = None


class OperatorMini(BaseModel):
    id: str
    display_name: str
    username: str

    model_config = {"from_attributes": True}


class MITREMini(BaseModel):
    id: str
    name: str
    tactic: str

    model_config = {"from_attributes": True}


class OPLOGEntryOut(BaseModel):
    id: str
    engagement_id: str
    operator: OperatorMini
    timestamp: datetime
    target: str
    action_type: str
    command_action: str
    outcome: str
    mitre_technique_id: str | None
    mitre_technique: MITREMini | None
    notes: str | None
    is_internal_only: bool
    created_at: datetime
    scope_status: str | None = None

    model_config = {"from_attributes": True}
