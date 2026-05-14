from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class OperatorCreate(BaseModel):
    username: str
    display_name: str
    password: str
    role: Literal["admin", "operator"] = "operator"


class OperatorUpdate(BaseModel):
    display_name: str | None = None
    role: Literal["admin", "operator"] | None = None


class OperatorPasswordChange(BaseModel):
    new_password: str


class OperatorOut(BaseModel):
    id: str
    username: str
    display_name: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class OperatorLogin(BaseModel):
    username: str
    password: str
