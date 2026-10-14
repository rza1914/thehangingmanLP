"""Request guards: in-memory rate limiting + production configuration checks.

The rate limit is per-process and resets on restart — deliberately simple for
a single-instance free-tier deployment, adequate for a personal contact form.
"""

import collections
import os
import time
from typing import Deque, Dict

RATE_WINDOW_SECONDS = 3600   # sliding window: one hour
RATE_LIMIT = 5               # allowed requests per window per IP
MAX_TRACKED_IPS = 10_000

_hits: Dict[str, Deque[float]] = {}


def client_ip(request) -> str:
    """Real client IP behind Render's proxy (X-Forwarded-For)."""
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def rate_limited(ip: str) -> bool:
    """True when this IP exceeded RATE_LIMIT inside the sliding window."""
    now = time.time()
    if len(_hits) > MAX_TRACKED_IPS:   # crude memory guard
        _hits.clear()
    q = _hits.setdefault(ip, collections.deque())
    while q and now - q[0] > RATE_WINDOW_SECONDS:
        q.popleft()
    if len(q) >= RATE_LIMIT:
        return True
    q.append(now)
    return False


def reset_rate_limits() -> None:
    """Test helper — clears all tracked windows."""
    _hits.clear()


def telegram_configured() -> bool:
    return bool(os.getenv("BOT_TOKEN")) and bool(os.getenv("CHAT_ID"))


def is_production() -> bool:
    return os.getenv("ENVIRONMENT", "development").strip().lower() == "production"