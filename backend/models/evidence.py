import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from core.database import Base

EVIDENCE_LABELS = [
    "access-proof",
    "credential",
    "loot",
    "screenshot",
    "scan-output",
    "artifact",
    "exploit-output",
]

FILE_TYPES = ["image", "text", "xml", "other"]


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    engagement_id = Column(String, ForeignKey("engagements.id"), nullable=False, index=True)
    oplog_entry_id = Column(String, ForeignKey("oplog_entries.id"), nullable=True, index=True)
    finding_id = Column(String, ForeignKey("engagement_findings.id"), nullable=True, index=True)
    display_id = Column(String, nullable=True)
    filename = Column(String, nullable=False)
    file_type = Column(Enum(*FILE_TYPES, name="file_type_enum"), nullable=False, default="other")
    file_path = Column(String, nullable=False)
    label = Column(Enum(*EVIDENCE_LABELS, name="evidence_label_enum"), nullable=True)
    description = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    engagement = relationship("Engagement", back_populates="evidence")
    oplog_entry = relationship("OPLOGEntry", back_populates="evidence")
    finding = relationship("EngagementFinding", back_populates="evidence")
