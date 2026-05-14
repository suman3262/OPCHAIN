import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, String, Table, ForeignKey, Text
from sqlalchemy.orm import relationship

from core.database import Base

engagement_operators = Table(
    "engagement_operators",
    Base.metadata,
    Column("engagement_id", String, ForeignKey("engagements.id"), primary_key=True),
    Column("operator_id", String, ForeignKey("operators.id"), primary_key=True),
)


class Engagement(Base):
    __tablename__ = "engagements"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    client_name = Column(String, nullable=False)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    status = Column(
        Enum("Planning", "Active", "Completed", "Archived", name="engagement_status"),
        nullable=False,
        default="Planning",
    )
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    operators = relationship("Operator", secondary=engagement_operators)
    scope_items = relationship("ScopeItem", back_populates="engagement", cascade="all, delete-orphan")
    oplog_entries = relationship("OPLOGEntry", back_populates="engagement", cascade="all, delete-orphan")
    findings = relationship("EngagementFinding", back_populates="engagement", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="engagement", cascade="all, delete-orphan")
