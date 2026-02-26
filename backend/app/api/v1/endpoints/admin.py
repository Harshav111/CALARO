from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from .... import crud, models, schemas
from ....database import get_db
from .auth import get_current_admin_user

router = APIRouter()

@router.get("/stats", response_model=Any)
def get_stats(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user),
):
    """
    Get system-wide statistics for admins.
    """
    user_count = db.query(models.User).count()
    log_count = db.query(models.FoodLog).count()
    
    # Average calories per log
    avg_calories = db.query(func.avg(models.FoodLog.total_calories)).scalar() or 0
    
    return {
        "total_users": user_count,
        "total_food_logs": log_count,
        "average_calories_per_log": round(float(avg_calories), 2),
    }

@router.get("/users", response_model=List[schemas.UserRead])
def list_users(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user),
    skip: int = 0,
    limit: int = 100,
):
    """
    List all users in the system.
    """
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.get("/logs", response_model=List[schemas.FoodLogRead])
def list_all_logs(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user),
    skip: int = 0,
    limit: int = 100,
):
    """
    List all food logs in the system.
    """
    logs = db.query(models.FoodLog).order_by(models.FoodLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs
