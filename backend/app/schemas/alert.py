from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.models.alert import AlertType, AlertSeverity


class AlertResponse(BaseModel):
    id: int
    user_id: int
    alert_type: AlertType
    severity: AlertSeverity
    title: str
    description: Optional[str]
    evidence_url: Optional[str]
    evidence_data: Dict[str, Any]
    threat_score: float
    is_read: bool
    is_resolved: bool
    is_dismissed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AlertUpdate(BaseModel):
    is_read: Optional[bool] = None
    is_resolved: Optional[bool] = None
    is_dismissed: Optional[bool] = None


class AlertStats(BaseModel):
    total: int
    unread: int
    critical: int
    high: int
    medium: int
    low: int
    by_type: Dict[str, int]
