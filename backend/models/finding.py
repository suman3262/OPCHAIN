import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON

from core.database import Base

SEVERITIES = ["Critical", "High", "Medium", "Low", "Informational"]
FINDING_STATUSES = ["Open", "Remediated", "Accepted", "False Positive"]


class FindingTemplate(Base):
    __tablename__ = "finding_templates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False, index=True)
    severity = Column(Enum(*SEVERITIES, name="severity_enum"), nullable=False)
    cvss_score = Column(Float, nullable=True)
    cvss_vector = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    impact = Column(Text, nullable=True)
    remediation = Column(Text, nullable=True)
    references = Column(JSON, default=list)
    mitre_techniques = Column(JSON, default=list)
    cwe_id = Column(String, nullable=True)
    tags = Column(JSON, default=list)
    is_custom = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class EngagementFinding(Base):
    __tablename__ = "engagement_findings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    engagement_id = Column(String, ForeignKey("engagements.id"), nullable=False, index=True)
    template_id = Column(String, ForeignKey("finding_templates.id"), nullable=True)
    title = Column(String, nullable=False)
    severity = Column(Enum(*SEVERITIES, name="severity_enum"), nullable=False)
    cvss_score = Column(Float, nullable=True)
    cvss_vector = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    impact = Column(Text, nullable=True)
    remediation = Column(Text, nullable=True)
    references = Column(JSON, default=list)
    mitre_techniques = Column(JSON, default=list)
    cwe_id = Column(String, nullable=True)
    status = Column(
        Enum(*FINDING_STATUSES, name="finding_status_enum"),
        nullable=False,
        default="Open",
    )
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    engagement = relationship("Engagement", back_populates="findings")
    template = relationship("FindingTemplate")
    evidence = relationship("Evidence", back_populates="finding")
