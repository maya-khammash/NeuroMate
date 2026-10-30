from pydantic import BaseModel, Field
from typing import Optional


class PatientInput(BaseModel):
    age: int = Field(..., ge=0, le=120, description="Patient age in years")
    sex: str = Field(..., description="Biological sex")

    mechanism: str = Field(..., description="Mechanism of injury")
    history: Optional[str] = Field(None, description="Relevant medical history")

    timeSinceInjury: float = Field(..., ge=0, description="Hours since injury")

    gcs: int = Field(..., ge=3, le=15, description="Glasgow Coma Scale")
    tbiSeverity: str = Field(..., description="TBI severity level")

    vomiting: int = Field(..., ge=0, description="Number of vomiting episodes")
    seizure: str = Field(..., description="Seizure type")

    loc: float = Field(..., ge=0, description="Loss of consciousness duration (min)")
    amnesia: float = Field(..., ge=0, description="Amnesia duration (min)")

    headache: int = Field(..., ge=1, le=10, description="Headache severity (1–10)")
    pupil: str = Field(..., description="Pupillary light reflex")

    class Config:
        json_schema_extra = {
            "example": {
                "age": 33,
                "sex": "Male",
                "mechanism": "Assault",
                "history": "Hypertension",
                "timeSinceInjury": 4,
                "gcs": 9,
                "tbiSeverity": "Moderate",
                "vomiting": 2,
                "seizure": "Focal",
                "loc": 22,
                "amnesia": 15,
                "headache": 7,
                "pupil": "Sluggish"
            }
        }
class PatientCreate(BaseModel):
    name: str
    age: int
    sex: str
    mechanism: str
    history: Optional[str]
    timeSinceInjury: int
    gcs: int
    tbiSeverity: str   # ✅ عدلناها
    vomiting: int
    seizure: str
    loc: int
    amnesia: int
    headache: int
    pupil: str
