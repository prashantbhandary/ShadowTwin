from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.identity import RiskLevel


class IdentityProfileCreate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    social_links: Optional[Dict[str, str]] = {}


class IdentityProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    social_links: Optional[Dict[str, str]] = None


class IdentityProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    location: Optional[str]
    bio: Optional[str]
    social_links: Dict[str, str]
    photos: List[str]
    risk_score: float
    risk_level: RiskLevel
    last_scan_at: Optional[datetime]
    is_primary: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ScanRequest(BaseModel):
    identity_profile_id: int
    scan_types: List[str] = ["osint", "face", "deepfake", "email_leak"]


class ScanResult(BaseModel):
    scan_id: str
    identity_profile_id: int
    status: str
    risk_score: float
    risk_level: str
    threats_found: int
    results: Dict[str, Any]
    started_at: datetime
    completed_at: Optional[datetime] = None
