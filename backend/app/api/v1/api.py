from fastapi import APIRouter

from .endpoints import admin, auth, food, voice, password_reset

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(password_reset.router, prefix="/password-reset", tags=["password_reset"])
api_router.include_router(food.router, prefix="/food", tags=["food"])
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
