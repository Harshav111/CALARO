from typing import List, Optional

from sqlalchemy.orm import Session

from . import models, schemas
from .core.security import get_password_hash, verify_password


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user_in: schemas.UserCreate) -> models.User:
    hashed_password = get_password_hash(user_in.password)
    # If no users exist, make this one an admin
    user_count = db.query(models.User).count()
    is_admin = user_count == 0
    
    db_user = models.User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_password,
        is_admin=is_admin,
        age=user_in.age,
        height_cm=user_in.height_cm,
        weight_kg=user_in.weight_kg,
        sex=user_in.sex,
        activity_level=user_in.activity_level,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(
    db: Session, email: str, password: str
) -> Optional[models.User]:
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def update_user_profile(
    db: Session, *, user: models.User, profile_in: schemas.UserProfileUpdate
) -> models.User:
    for field in ("age", "height_cm", "weight_kg", "sex", "activity_level"):
        value = getattr(profile_in, field)
        if value is not None:
            setattr(user, field, value)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_food_log(
    db: Session, *, user_id: int, food_log_in: schemas.FoodLogCreate
) -> models.FoodLog:
    # Calculate total calories from the items provided by AI service
    total_calories = sum(item.calories or 0.0 for item in food_log_in.items)

    db_log = models.FoodLog(
        user_id=user_id,
        raw_text=food_log_in.raw_text,
        items=[item.model_dump() for item in food_log_in.items],
        total_calories=total_calories,
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


def get_food_logs_for_user(
    db: Session, *, user_id: int, skip: int = 0, limit: int = 50
) -> List[models.FoodLog]:
    return (
        db.query(models.FoodLog)
        .filter(models.FoodLog.user_id == user_id)
        .order_by(models.FoodLog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

