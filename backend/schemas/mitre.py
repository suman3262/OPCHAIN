from pydantic import BaseModel


class MITRETechniqueOut(BaseModel):
    id: str
    name: str
    tactic: str
    description: str | None
    url: str | None

    model_config = {"from_attributes": True}
