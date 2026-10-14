from fastapi import APIRouter
from backend.database.models import AnalyticsData
from backend.database.db import get_analytics_metrics

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsData)
def fetch_analytics():
    return get_analytics_metrics()
