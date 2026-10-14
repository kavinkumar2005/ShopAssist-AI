from fastapi import APIRouter
from backend.database.models import UserPreferences
from backend.database.db import get_user_preferences, save_user_preferences

router = APIRouter(prefix="/preferences", tags=["Preferences"])

@router.get("", response_model=UserPreferences)
def fetch_preferences(user_id: str = "default_user"):
    return get_user_preferences(user_id)

@router.post("", response_model=UserPreferences)
def update_preferences(payload: UserPreferences):
    return save_user_preferences(payload.model_dump())
