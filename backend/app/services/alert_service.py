from sqlalchemy.ext.asyncio import AsyncSession
from app.models.alert import Alert, AlertType, AlertSeverity
from app.models.user import User
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class AlertService:
    """Service to create and manage security alerts."""

    async def create_alert(
        self,
        db: AsyncSession,
        user_id: int,
        alert_type: AlertType,
        severity: AlertSeverity,
        title: str,
        description: Optional[str] = None,
        evidence_url: Optional[str] = None,
        evidence_data: Optional[Dict[str, Any]] = None,
        threat_score: float = 0.0,
    ) -> Alert:
        alert = Alert(
            user_id=user_id,
            alert_type=alert_type,
            severity=severity,
            title=title,
            description=description,
            evidence_url=evidence_url,
            evidence_data=evidence_data or {},
            threat_score=threat_score,
        )
        db.add(alert)
        await db.flush()
        await db.refresh(alert)

        logger.info(f"Alert created: {alert_type.value} for user {user_id} - {title}")
        return alert

    async def create_face_match_alert(
        self, db: AsyncSession, user_id: int, match_data: Dict[str, Any]
    ) -> Alert:
        similarity = match_data.get("similarity_percentage", 0)
        severity = (
            AlertSeverity.critical if similarity >= 90
            else AlertSeverity.high if similarity >= 75
            else AlertSeverity.medium
        )
        return await self.create_alert(
            db, user_id,
            AlertType.image_copy,
            severity,
            f"Face similarity detected: {similarity}%",
            f"A face matching {similarity}% of your identity was found. {match_data.get('analysis', '')}",
            evidence_data=match_data,
            threat_score=similarity,
        )

    async def create_email_leak_alert(
        self, db: AsyncSession, user_id: int, leak_data: Dict[str, Any]
    ) -> Alert:
        breach_count = leak_data.get("total_breaches", 0)
        severity_map = {0: AlertSeverity.info, 1: AlertSeverity.low, 3: AlertSeverity.medium}
        severity = (
            AlertSeverity.critical if breach_count > 5
            else AlertSeverity.high if breach_count > 3
            else AlertSeverity.medium if breach_count > 1
            else AlertSeverity.low
        )
        return await self.create_alert(
            db, user_id,
            AlertType.email_leak,
            severity,
            f"Email found in {breach_count} data breach{'es' if breach_count != 1 else ''}",
            f"Your email was exposed in {breach_count} known data breaches. Immediate password changes recommended.",
            evidence_data=leak_data,
            threat_score=leak_data.get("severity", 0),
        )

    async def create_fake_profile_alert(
        self, db: AsyncSession, user_id: int, profile_data: Dict[str, Any]
    ) -> Alert:
        risk_score = profile_data.get("risk_score", 0)
        severity = (
            AlertSeverity.critical if risk_score >= 75
            else AlertSeverity.high if risk_score >= 50
            else AlertSeverity.medium
        )
        return await self.create_alert(
            db, user_id,
            AlertType.fake_profile,
            severity,
            f"Suspicious profile detected: {profile_data.get('risk_label', 'Unknown')}",
            f"A potentially fake profile was found at {profile_data.get('profile_url')} with risk score {risk_score}%.",
            evidence_url=profile_data.get("profile_url"),
            evidence_data=profile_data,
            threat_score=risk_score,
        )


alert_service = AlertService()
