import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, String
from sqlalchemy.orm import relationship

from core.database import Base


class Operator(Base):
    __tablename__ = "operators"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, nullable=False, index=True)
    display_name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum("admin", "operator", name="operator_role"), nullable=False, default="operator")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    oplog_entries = relationship("OPLOGEntry", back_populates="operator")
