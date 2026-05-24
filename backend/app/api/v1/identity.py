from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.identity import IdentityProfile
from app.schemas.identity import IdentityProfileCreate, IdentityProfileUpdate, IdentityProfileResponse
from app.core.config import settings
import os, shutil, uuid, json

router = APIRouter(prefix="/identity", tags=["Identity"])


@router.get("/profiles", response_model=List[IdentityProfileResponse])
async def get_profiles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(IdentityProfile).where(IdentityProfile.user_id == current_user.id)
    )
    return result.scalars().all()


@router.post("/profiles", response_model=IdentityProfileResponse, status_code=201)
async def create_profile(
    profile_data: IdentityProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(IdentityProfile).where(IdentityProfile.user_id == current_user.id)
    )
    existing = result.scalars().all()
    is_primary = len(existing) == 0

    profile = IdentityProfile(
        user_id=current_user.id,
        full_name=profile_data.full_name,
        email=profile_data.email,
        phone=profile_data.phone,
        location=profile_data.location,
        bio=profile_data.bio,
        social_links=profile_data.social_links or {},
        photos=[],
        is_primary=is_primary,
    )
    db.add(profile)
    await db.flush()
    await db.refresh(profile)
    return profile


@router.get("/profiles/{profile_id}", response_model=IdentityProfileResponse)
async def get_profile(
    profile_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(IdentityProfile).where(
            IdentityProfile.id == profile_id,
            IdentityProfile.user_id == current_user.id,
        )
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.patch("/profiles/{profile_id}", response_model=IdentityProfileResponse)
async def update_profile(
    profile_id: int,
    update_data: IdentityProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(IdentityProfile).where(
            IdentityProfile.id == profile_id,
            IdentityProfile.user_id == current_user.id,
        )
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    for field, value in update_data.model_dump(exclude_none=True).items():
        setattr(profile, field, value)

    await db.flush()
    await db.refresh(profile)
    return profile


@router.post("/profiles/{profile_id}/photos", response_model=IdentityProfileResponse)
async def upload_photo(
    profile_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(IdentityProfile).where(
            IdentityProfile.id == profile_id,
            IdentityProfile.user_id == current_user.id,
        )
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    ext = file.filename.split(".")[-1]
    filename = f"identity_{profile_id}_{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    photos = list(profile.photos or [])
    photos.append(f"/uploads/{filename}")
    profile.photos = photos

    await db.flush()
    await db.refresh(profile)
    return profile


@router.delete("/profiles/{profile_id}")
async def delete_profile(
    profile_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(IdentityProfile).where(
            IdentityProfile.id == profile_id,
            IdentityProfile.user_id == current_user.id,
        )
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    await db.delete(profile)
    return {"message": "Profile deleted"}
