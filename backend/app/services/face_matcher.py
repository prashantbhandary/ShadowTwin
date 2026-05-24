import asyncio
from typing import Dict, Any


class FaceMatcher:
    """
    Face similarity detection using DeepFace.
    Compares two face images and returns similarity metrics.
    """

    SIMILARITY_LABELS = {
        (0.0, 0.3): ("Highly Similar", "critical", 95),
        (0.3, 0.5): ("Possibly Copied", "high", 75),
        (0.5, 0.7): ("Low Similarity", "medium", 40),
        (0.7, 1.0): ("Safe", "low", 10),
    }

    async def compare(self, img1_path: str, img2_path: str) -> Dict[str, Any]:
        """Compare two face images asynchronously."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._compare_sync, img1_path, img2_path)

    def _compare_sync(self, img1_path: str, img2_path: str) -> Dict[str, Any]:
        try:
            from deepface import DeepFace

            result = DeepFace.verify(
                img1_path=img1_path,
                img2_path=img2_path,
                model_name="VGG-Face",
                enforce_detection=False,
                distance_metric="cosine",
            )

            distance = result.get("distance", 1.0)
            verified = result.get("verified", False)
            similarity_pct = max(0, min(100, round((1 - distance) * 100, 2)))

            label, risk_level, threat_score = self._get_label(distance)

            return {
                "verified": verified,
                "distance": round(distance, 4),
                "similarity_percentage": similarity_pct,
                "label": label,
                "risk_level": risk_level,
                "threat_score": threat_score,
                "model": "VGG-Face",
                "metric": "cosine",
                "threshold": result.get("threshold", 0.4),
                "analysis": self._get_analysis(label, similarity_pct),
            }

        except ImportError:
            return self._mock_result()
        except Exception as e:
            return {
                "error": str(e),
                "verified": False,
                "distance": 1.0,
                "similarity_percentage": 0.0,
                "label": "Unknown",
                "risk_level": "low",
                "threat_score": 0,
            }

    def _get_label(self, distance: float):
        for (low, high), (label, risk, score) in self.SIMILARITY_LABELS.items():
            if low <= distance < high:
                return label, risk, score
        return "Safe", "low", 10

    def _get_analysis(self, label: str, pct: float) -> str:
        if label == "Highly Similar":
            return f"Faces are {pct}% similar — strong indicator of identity theft or impersonation."
        elif label == "Possibly Copied":
            return f"Faces share {pct}% similarity — possible image reuse detected. Manual review recommended."
        elif label == "Low Similarity":
            return f"Faces are {pct}% similar — unlikely to be the same person."
        else:
            return f"Faces show {pct}% similarity — no identity threat detected."

    def _mock_result(self):
        """Return mock result when DeepFace is not available."""
        import random
        distance = random.uniform(0.1, 0.9)
        similarity_pct = round((1 - distance) * 100, 2)
        label, risk_level, threat_score = self._get_label(distance)
        return {
            "verified": distance < 0.4,
            "distance": round(distance, 4),
            "similarity_percentage": similarity_pct,
            "label": label,
            "risk_level": risk_level,
            "threat_score": threat_score,
            "model": "VGG-Face (mock)",
            "metric": "cosine",
            "threshold": 0.4,
            "analysis": self._get_analysis(label, similarity_pct),
            "mock": True,
        }
