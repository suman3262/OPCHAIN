import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from core.database import Base

ACTION_TYPES = [
    "Recon",
    "Initial Access",
    "Execution",
    "Persistence",
    "Privilege Escalation",
    "Lateral Movement",
    "Collection",
    "Exfiltration",
    "Social Engineering",
    "Physical",
]

OUTCOMES = ["Success", "Failed", "Partial", "Blocked"]


class OPLOGEntry(Base):
    __tablename__ = "oplog_entries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    engagement_id = Column(String, ForeignKey("engagements.id"), nullable=False, index=True)
    operator_id = Column(String, ForeignKey("operators.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    target = Column(String, nullable=False)
    action_type = Column(
        Enum(*ACTION_TYPES, name="action_type_enum"),
        nullable=False,
    )
    command_action = Column(Text, nullable=False)
    outcome = Column(
        Enum(*OUTCOMES, name="outcome_enum"),
        nullable=False,
    )
    mitre_technique_id = Column(String, ForeignKey("mitre_techniques.id"), nullable=True, index=True)
    notes = Column(Text, nullable=True)
    is_internal_only = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    engagement = relationship("Engagement", back_populates="oplog_entries")
    operator = relationship("Operator", back_populates="oplog_entries")
    evidence = relationship("Evidence", back_populates="oplog_entry")
    mitre_technique = relationship("MITRETechnique")
