from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    # Optional profile fields for personalized TDEE
    age = Column(Integer, nullable=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    sex = Column(String, nullable=True)  # "male" or "female"
    activity_level = Column(
        String, nullable=True
    )  # sedentary, light, moderate, active, very_active

    food_logs = relationship("FoodLog", back_populates="user", cascade="all,delete")


class FoodLog(Base):
    __tablename__ = "food_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Raw text that user spoke / typed
    raw_text = Column(String, nullable=False)

    # Parsed food items from LLM
    items = Column(JSON, nullable=False)

    # Simple calorie summary for now (per log)
    total_calories = Column(Float, nullable=True)

    user = relationship("User", back_populates="food_logs")

