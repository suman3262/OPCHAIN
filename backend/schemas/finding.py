from datetime import datetime
from typing import Literal

from pydantic import BaseModel

SEVERITIES = ["Critical", "High", "Medium", "Low", "Informational"]


class FindingTemplateCreate(BaseModel):
    title: str
    severity: str
    cvss_score: float | None = None
    cvss_vector: str | None = None
    description: str | None = None
    impact: str | None = None
    remediation: str | None = None
    references: list[str] = []
    mitre_techniques: list[str] = []
    cwe_id: str | None = None
    tags: list[str] = []


class FindingTemplateUpdate(BaseModel):
    title: str | None = None
    severity: str | None = None
    cvss_score: float | None = None
    cvss_vector: str | None = None
    description: str | None = None
    impact: str | None = None
    remediation: str | None = None
    references: list[str] | None = None
    mitre_techniques: list[str] | None = None
    cwe_id: str | None = None
    tags: list[str] | None = None


class FindingTemplateOut(BaseModel):
    id: str
    title: str
    severity: str
    cvss_score: float | None
    cvss_vector: str | None
    description: str | None
    impact: str | None
    remediation: str | None
    references: list[str]
    mitre_techniques: list[str]
    cwe_id: str | None
    tags: list[str]
    is_custom: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class EngagementFindingCreate(BaseModel):
    template_id: str | None = None
    title: str | None = None
    severity: str | None = None
    cvss_score: float | None = None
    cvss_vector: str | None = None
    description: str | None = None
    impact: str | None = None
    remediation: str | None = None
    references: list[str] = []
    mitre_techniques: list[str] = []
    cwe_id: str | None = None


class EngagementFindingUpdate(BaseModel):
    title: str | None = None
    severity: str | None = None
    cvss_score: float | None = None
    cvss_vector: str | None = None
    description: str | None = None
    impact: str | None = None
    remediation: str | None = None
    references: list[str] | None = None
    mitre_techniques: list[str] | None = None
    cwe_id: str | None = None
    status: Literal["Open", "Remediated", "Accepted", "False Positive"] | None = None


class EngagementFindingOut(BaseModel):
    id: str
    engagement_id: str
    template_id: str | None
    title: str
    severity: str
    cvss_score: float | None
    cvss_vector: str | None
    description: str | None
    impact: str | None
    remediation: str | None
    references: list[str]
    mitre_techniques: list[str]
    cwe_id: str | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
