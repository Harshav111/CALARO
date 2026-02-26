from fastapi import APIRouter

from .endpoints import admin, auth, food, voice


api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(food.router, prefix="/food", tags=["food"])
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])


