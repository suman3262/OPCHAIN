from sqlalchemy import Column, String, Text

from core.database import Base


class MITRETechnique(Base):
    __tablename__ = "mitre_techniques"

    id = Column(String, primary_key=True)  # T-code e.g. T1078
    name = Column(String, nullable=False, index=True)
    tactic = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    url = Column(String, nullable=True)
