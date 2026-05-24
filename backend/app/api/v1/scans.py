from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.identity import IdentityProfile
from app.services.face_matcher import FaceMatcher
from app.services.osint_scanner import OSINTScanner
from app.services.email_leak_checker import EmailLeakChecker
from app.services.fake_profile_detector import FakeProfileDetector
from app.services.deepfake_detector import DeepfakeDetector
from app.schemas.identity import ScanRequest, ScanResult
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/scans", tags=["Scans"])

face_matcher = FaceMatcher()
osint_scanner = OSINTScanner()
email_leak_checker = EmailLeakChecker()
fake_profile_detector = FakeProfileDetector()
deepfake_detector = DeepfakeDetector()


@router.post("/face-compare")
async def compare_faces(
    img1: UploadFile = File(...),
    img2: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Compare two face images for similarity."""
    import os, shutil
    from app.core.config import settings

    path1 = os.path.join(settings.UPLOAD_DIR, f"fc_{uuid.uuid4().hex}_{img1.filename}")
    path2 = os.path.join(settings.UPLOAD_DIR, f"fc_{uuid.uuid4().hex}_{img2.filename}")

    with open(path1, "wb") as f:
        shutil.copyfileobj(img1.file, f)
    with open(path2, "wb") as f:
        shutil.copyfileobj(img2.file, f)

    try:
        result = await face_matcher.compare(path1, path2)
        return result
    finally:
        for p in [path1, path2]:
            if os.path.exists(p):
                os.remove(p)


@router.post("/deepfake-detect")
async def detect_deepfake(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Detect if an image is AI-generated or a deepfake."""
    import os, shutil
    from app.core.config import settings

    path = os.path.join(settings.UPLOAD_DIR, f"df_{uuid.uuid4().hex}_{image.filename}")
    with open(path, "wb") as f:
        shutil.copyfileobj(image.file, f)

    try:
        result = await deepfake_detector.analyze(path)
        return result
    finally:
        if os.path.exists(path):
            os.remove(path)


@router.post("/email-leak")
async def check_email_leak(
    email: str,
    current_user: User = Depends(get_current_user),
):
    """Check if an email has been in any data breaches."""
    return await email_leak_checker.check(email)


@router.post("/osint")
async def run_osint(
    query: str,
    scan_type: str = "username",
    current_user: User = Depends(get_current_user),
):
    """Run OSINT scan for username, email, or name."""
    return await osint_scanner.scan(query, scan_type)


@router.post("/fake-profile")
async def detect_fake_profile(
    profile_url: str,
    current_user: User = Depends(get_current_user),
):
    """Analyze a social media profile for fake indicators."""
    return await fake_profile_detector.analyze(profile_url)


@router.post("/full-scan")
async def run_full_scan(
    scan_request: ScanRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run a comprehensive identity scan."""
    result = await db.execute(
        select(IdentityProfile).where(
            IdentityProfile.id == scan_request.identity_profile_id,
            IdentityProfile.user_id == current_user.id,
        )
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Identity profile not found")

    scan_id = str(uuid.uuid4())

    # Queue background scan
    background_tasks.add_task(
        _run_background_scan,
        scan_id=scan_id,
        profile=profile,
        scan_types=scan_request.scan_types,
        db=db,
    )

    return {
        "scan_id": scan_id,
        "status": "queued",
        "message": "Scan started. Results will be available shortly.",
        "started_at": datetime.now(timezone.utc).isoformat(),
    }


async def _run_background_scan(scan_id: str, profile: IdentityProfile, scan_types: list, db: AsyncSession):
    """Background task to run all scan types."""
    from app.core.database import mongodb
    results = {}

    if "email_leak" in scan_types and profile.email:
        results["email_leak"] = await email_leak_checker.check(profile.email)

    if "osint" in scan_types and profile.full_name:
        results["osint"] = await osint_scanner.scan(profile.full_name, "name")

    # Save results to MongoDB
    try:
        collection = mongodb.get_collection("scan_results")
        await collection.insert_one({
            "scan_id": scan_id,
            "profile_id": profile.id,
            "user_id": profile.user_id,
            "results": results,
            "completed_at": datetime.now(timezone.utc),
        })
    except Exception:
        pass
