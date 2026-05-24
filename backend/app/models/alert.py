from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, JSON, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class AlertType(str, enum.Enum):
    fake_profile = "fake_profile"
    image_copy = "image_copy"
    email_leak = "email_leak"
    deepfake = "deepfake"
    osint_hit = "osint_hit"
    risk_increase = "risk_increase"
    username_squatting = "username_squatting"


class AlertSeverity(str, enum.Enum):
    info = "info"
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    alert_type = Column(Enum(AlertType), nullable=False)
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.medium)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)

    # Evidence / metadata
    evidence_url = Column(String(1000), nullable=True)
    evidence_data = Column(JSON, default=dict)
    threat_score = Column(Float, default=0.0)

    is_read = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="alerts")
