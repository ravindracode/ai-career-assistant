from pydantic import BaseModel, Field


class ResumeAnalysis(BaseModel):
    candidate_name: str
    email: str | None = None
    phone: str | None = None
    skills: list[str] = Field(default_factory=list)
    experience_years: float | None = None
    education: list[str] = Field(default_factory=list)
    professional_summary: str
