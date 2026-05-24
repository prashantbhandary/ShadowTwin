from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import List, Optional
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.alert import Alert, AlertSeverity, AlertType
from app.schemas.alert import AlertResponse, AlertUpdate, AlertStats

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=List[AlertResponse])
async def get_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    severity: Optional[AlertSeverity] = None,
    alert_type: Optional[AlertType] = None,
    unread_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Alert).where(
        Alert.user_id == current_user.id,
        Alert.is_dismissed == False,
    )

    if severity:
        query = query.where(Alert.severity == severity)
    if alert_type:
        query = query.where(Alert.alert_type == alert_type)
    if unread_only:
        query = query.where(Alert.is_read == False)

    query = query.order_by(Alert.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/stats", response_model=AlertStats)
async def get_alert_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    base_query = select(Alert).where(
        Alert.user_id == current_user.id,
        Alert.is_dismissed == False,
    )

    result = await db.execute(base_query)
    all_alerts = result.scalars().all()

    by_type = {}
    for alert in all_alerts:
        key = alert.alert_type.value
        by_type[key] = by_type.get(key, 0) + 1

    return AlertStats(
        total=len(all_alerts),
        unread=sum(1 for a in all_alerts if not a.is_read),
        critical=sum(1 for a in all_alerts if a.severity == AlertSeverity.critical),
        high=sum(1 for a in all_alerts if a.severity == AlertSeverity.high),
        medium=sum(1 for a in all_alerts if a.severity == AlertSeverity.medium),
        low=sum(1 for a in all_alerts if a.severity == AlertSeverity.low),
        by_type=by_type,
    )


@router.patch("/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: int,
    update_data: AlertUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Alert).where(Alert.id == alert_id, Alert.user_id == current_user.id)
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    for field, value in update_data.model_dump(exclude_none=True).items():
        setattr(alert, field, value)

    await db.flush()
    await db.refresh(alert)
    return alert


@router.post("/mark-all-read")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Alert).where(Alert.user_id == current_user.id, Alert.is_read == False)
    )
    alerts = result.scalars().all()
    for alert in alerts:
        alert.is_read = True
    await db.flush()
    return {"message": f"Marked {len(alerts)} alerts as read"}
