import asyncio
import aiohttp
from typing import Dict, Any, List
from datetime import datetime, timezone
import re


PLATFORM_URLS = {
    "twitter": "https://twitter.com/{username}",
    "instagram": "https://instagram.com/{username}",
    "facebook": "https://facebook.com/{username}",
    "github": "https://github.com/{username}",
    "linkedin": "https://linkedin.com/in/{username}",
    "reddit": "https://reddit.com/user/{username}",
    "tiktok": "https://tiktok.com/@{username}",
    "youtube": "https://youtube.com/@{username}",
    "pinterest": "https://pinterest.com/{username}",
    "snapchat": "https://snapchat.com/add/{username}",
    "twitch": "https://twitch.tv/{username}",
    "medium": "https://medium.com/@{username}",
    "tumblr": "https://{username}.tumblr.com",
    "devto": "https://dev.to/{username}",
    "hackernews": "https://news.ycombinator.com/user?id={username}",
}


class OSINTScanner:
    """
    OSINT scanner for detecting identity presence across platforms.
    """

    async def scan(self, query: str, scan_type: str = "username") -> Dict[str, Any]:
        """
        Scan for identity information across the web.
        scan_type: 'username', 'email', 'name'
        """
        started_at = datetime.now(timezone.utc)

        if scan_type == "username":
            results = await self._scan_username(query)
        elif scan_type == "email":
            results = await self._scan_email(query)
        else:
            results = await self._scan_name(query)

        risk_score = self._calculate_risk_score(results)

        return {
            "query": query,
            "scan_type": scan_type,
            "platforms_checked": len(PLATFORM_URLS),
            "hits_found": len([r for r in results if r.get("found")]),
            "risk_score": risk_score,
            "risk_level": self._get_risk_level(risk_score),
            "results": results,
            "started_at": started_at.isoformat(),
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }

    async def _scan_username(self, username: str) -> List[Dict[str, Any]]:
        """Check username across all major platforms."""
        tasks = []
        platforms = list(PLATFORM_URLS.items())

        async with aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={"User-Agent": "Mozilla/5.0 (compatible; ShadowTwin/1.0)"},
        ) as session:
            tasks = [
                self._check_platform(session, platform, url.format(username=username), username)
                for platform, url in platforms
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)

        return [r for r in results if isinstance(r, dict)]

    async def _check_platform(
        self, session: aiohttp.ClientSession, platform: str, url: str, username: str
    ) -> Dict[str, Any]:
        try:
            async with session.get(url, allow_redirects=True) as response:
                found = response.status == 200
                return {
                    "platform": platform,
                    "url": url,
                    "found": found,
                    "status_code": response.status,
                    "suspicious": False,
                    "details": f"Profile {'found' if found else 'not found'} on {platform}",
                }
        except Exception as e:
            return {
                "platform": platform,
                "url": url,
                "found": False,
                "status_code": None,
                "suspicious": False,
                "details": f"Could not reach {platform}",
            }

    async def _scan_email(self, email: str) -> List[Dict[str, Any]]:
        """Scan for email presence (OSINT)."""
        domain = email.split("@")[-1] if "@" in email else ""
        return [
            {
                "platform": "Email Domain",
                "url": f"https://{domain}",
                "found": True,
                "suspicious": domain in ["guerrillamail.com", "10minutemail.com", "throwam.com"],
                "details": f"Domain {domain} detected",
            }
        ]

    async def _scan_name(self, name: str) -> List[Dict[str, Any]]:
        """Scan for name presence."""
        slug = name.lower().replace(" ", "")
        return await self._scan_username(slug)

    def _calculate_risk_score(self, results: List[Dict]) -> float:
        hits = sum(1 for r in results if r.get("found"))
        suspicious = sum(1 for r in results if r.get("suspicious"))
        base_score = (hits / max(len(PLATFORM_URLS), 1)) * 50
        suspicious_score = suspicious * 15
        return min(100, round(base_score + suspicious_score, 1))

    def _get_risk_level(self, score: float) -> str:
        if score >= 75:
            return "critical"
        elif score >= 50:
            return "high"
        elif score >= 25:
            return "medium"
        return "low"
