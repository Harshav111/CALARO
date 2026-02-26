from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

    age: Optional[int] = Field(default=None, ge=0, le=120)
    height_cm: Optional[float] = Field(default=None, ge=50, le=250)
    weight_kg: Optional[float] = Field(default=None, ge=20, le=300)
    sex: Optional[str] = Field(default=None)
    activity_level: Optional[str] = Field(default=None)


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserRead(UserBase):
    id: int
    is_active: bool
    is_admin: bool

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[str] = None


class UserProfileUpdate(BaseModel):
    age: Optional[int] = Field(default=None, ge=0, le=120)
    height_cm: Optional[float] = Field(default=None, ge=50, le=250)
    weight_kg: Optional[float] = Field(default=None, ge=20, le=300)
    sex: Optional[str] = None
    activity_level: Optional[str] = None


class UserProfile(BaseModel):
    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    sex: Optional[str] = None
    activity_level: Optional[str] = None
    tdee: Optional[float] = None


class FoodItem(BaseModel):
    name: str
    quantity: float
    unit: str
    calories: Optional[float] = None


class FoodLogBase(BaseModel):
    raw_text: str
    items: List[FoodItem]


class FoodLogCreate(FoodLogBase):
    pass


class FoodLogRead(FoodLogBase):
    id: int
    created_at: datetime
    total_calories: Optional[float] = None

    model_config = {"from_attributes": True}


class VoiceParseResponse(BaseModel):
    text: str
    items: List[FoodItem]


