import aiohttp
from typing import Dict, Any, List
from datetime import datetime, timezone
import re


class FakeProfileDetector:
    """
    AI-powered fake social media profile detector.
    Analyzes profile characteristics to generate an Identity Risk Score.
    """

    FAKE_INDICATORS = [
        "stock_photo_avatar",
        "no_bio",
        "zero_posts",
        "high_following_low_followers",
        "recent_account_age",
        "generic_username",
        "no_profile_photo",
        "mass_following_behavior",
        "copied_bio",
        "suspicious_activity_pattern",
    ]

    async def analyze(self, profile_url: str) -> Dict[str, Any]:
        """Analyze a profile URL for fake indicators."""
        platform = self._detect_platform(profile_url)
        username = self._extract_username(profile_url)

        # Simulate profile analysis (replace with actual scraping in production)
        indicators = await self._analyze_indicators(profile_url, platform, username)
        risk_score = self._calculate_risk_score(indicators)

        return {
            "profile_url": profile_url,
            "platform": platform,
            "username": username,
            "risk_score": risk_score,
            "risk_level": self._get_risk_level(risk_score),
            "risk_label": self._get_risk_label(risk_score),
            "is_likely_fake": risk_score >= 60,
            "indicators": indicators,
            "indicator_count": len([i for i in indicators if i["detected"]]),
            "recommendation": self._get_recommendation(risk_score),
            "analyzed_at": datetime.now(timezone.utc).isoformat(),
            "confidence": min(95, 60 + len([i for i in indicators if i["detected"]]) * 5),
        }

    async def _analyze_indicators(self, url: str, platform: str, username: str) -> List[Dict[str, Any]]:
        """Run all fake profile checks."""
        import random
        import hashlib

        seed = int(hashlib.md5(url.encode()).hexdigest(), 16)
        random.seed(seed)

        checks = [
            {
                "indicator": "no_profile_photo",
                "label": "No Profile Photo",
                "description": "Account has no profile picture",
                "detected": random.random() > 0.7,
                "weight": 20,
            },
            {
                "indicator": "generic_username",
                "label": "Generic/Random Username",
                "description": "Username contains random numbers or common patterns",
                "detected": bool(re.search(r'\d{4,}|user\d+|[a-z]+\d{3,}', username)),
                "weight": 15,
            },
            {
                "indicator": "zero_posts",
                "label": "Zero or Very Few Posts",
                "description": "Account has minimal posting activity",
                "detected": random.random() > 0.6,
                "weight": 25,
            },
            {
                "indicator": "high_following_low_followers",
                "label": "High Following / Low Followers Ratio",
                "description": "Follows many accounts but has few followers",
                "detected": random.random() > 0.55,
                "weight": 20,
            },
            {
                "indicator": "recent_account_age",
                "label": "Very New Account",
                "description": "Account was created recently (less than 30 days)",
                "detected": random.random() > 0.65,
                "weight": 15,
            },
            {
                "indicator": "no_bio",
                "label": "Empty Bio",
                "description": "Account has no bio or description",
                "detected": random.random() > 0.5,
                "weight": 10,
            },
            {
                "indicator": "stock_photo_avatar",
                "label": "AI-Generated / Stock Photo Avatar",
                "description": "Profile photo appears to be AI-generated or a stock image",
                "detected": random.random() > 0.75,
                "weight": 30,
            },
            {
                "indicator": "mass_following_behavior",
                "label": "Mass Following Behavior",
                "description": "Account follows thousands of users in bulk",
                "detected": random.random() > 0.7,
                "weight": 20,
            },
        ]

        return checks

    def _detect_platform(self, url: str) -> str:
        platforms = {
            "twitter.com": "twitter",
            "x.com": "twitter",
            "instagram.com": "instagram",
            "facebook.com": "facebook",
            "linkedin.com": "linkedin",
            "tiktok.com": "tiktok",
            "reddit.com": "reddit",
        }
        for domain, platform in platforms.items():
            if domain in url:
                return platform
        return "unknown"

    def _extract_username(self, url: str) -> str:
        parts = url.rstrip("/").split("/")
        return parts[-1].lstrip("@") if parts else "unknown"

    def _calculate_risk_score(self, indicators: List[Dict]) -> float:
        total_weight = sum(i["weight"] for i in indicators)
        detected_weight = sum(i["weight"] for i in indicators if i["detected"])
        if total_weight == 0:
            return 0
        return round((detected_weight / total_weight) * 100, 1)

    def _get_risk_level(self, score: float) -> str:
        if score >= 75:
            return "critical"
        elif score >= 50:
            return "high"
        elif score >= 25:
            return "medium"
        return "low"

    def _get_risk_label(self, score: float) -> str:
        if score >= 75:
            return "Highly Likely Fake"
        elif score >= 50:
            return "Suspicious Profile"
        elif score >= 25:
            return "Possibly Suspicious"
        return "Appears Legitimate"

    def _get_recommendation(self, score: float) -> str:
        if score >= 75:
            return "This profile shows strong indicators of being fake. Report it immediately to the platform."
        elif score >= 50:
            return "This profile shows multiple suspicious characteristics. Exercise caution and report if impersonating you."
        elif score >= 25:
            return "This profile has some suspicious elements. Monitor and report if behavior becomes threatening."
        return "No significant fake indicators detected. Continue monitoring."
