import uuid

from sqlalchemy import Column, Enum, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from core.database import Base


class ScopeItem(Base):
    __tablename__ = "scope_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    engagement_id = Column(String, ForeignKey("engagements.id"), nullable=False, index=True)
    value = Column(String, nullable=False)
    type = Column(Enum("in_scope", "out_of_scope", name="scope_type"), nullable=False)
    notes = Column(Text, nullable=True)

    engagement = relationship("Engagement", back_populates="scope_items")
