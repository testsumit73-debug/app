from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    email: str
    full_name: str
    created_at: datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    token: str
    user: UserResponse

class PersonalInfo(BaseModel):
    full_name: str
    email: str
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    portfolio: str = ""

class WorkExperience(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company: str
    position: str
    location: str = ""
    start_date: str
    end_date: str
    current: bool = False
    description: List[str] = []

class Education(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    institution: str
    degree: str
    field: str = ""
    location: str = ""
    start_date: str
    end_date: str
    gpa: str = ""

class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    technologies: List[str] = []
    link: str = ""

class Certification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    issuer: str
    date: str
    credential_id: str = ""

class ResumeCreate(BaseModel):
    title: str
    template_id: str = "ats-tech"
    personal_info: PersonalInfo
    professional_summary: str = ""
    skills: List[str] = []
    work_experience: List[WorkExperience] = []
    education: List[Education] = []
    projects: List[Project] = []
    certifications: List[Certification] = []

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    template_id: Optional[str] = None
    personal_info: Optional[PersonalInfo] = None
    professional_summary: Optional[str] = None
    skills: Optional[List[str]] = None
    work_experience: Optional[List[WorkExperience]] = None
    education: Optional[List[Education]] = None
    projects: Optional[List[Project]] = None
    certifications: Optional[List[Certification]] = None

class ResumeResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    user_id: str
    title: str
    template_id: str
    personal_info: PersonalInfo
    professional_summary: str
    skills: List[str]
    work_experience: List[WorkExperience]
    education: List[Education]
    projects: List[Project]
    certifications: List[Certification]
    ats_score: int
    created_at: datetime
    updated_at: datetime

class ATSScoreResponse(BaseModel):
    score: int
    suggestions: List[str]
    missing_keywords: List[str]
