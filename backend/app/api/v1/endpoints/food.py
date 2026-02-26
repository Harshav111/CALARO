from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .... import crud, models, schemas
from ....database import get_db
from ....services.ai_service import extract_food_info
from .auth import get_current_user


router = APIRouter()


@router.post(
    "/parse",
    response_model=List[schemas.FoodItem],
    summary="Use AI to extract structured food items from natural language",
)
async def parse_food(
    text: str,
):
    items = await extract_food_info(text=text)
    # Ensure items conform to FoodItem schema
    return [schemas.FoodItem(**item) for item in items]


@router.post(
    "/logs",
    response_model=schemas.FoodLogRead,
    summary="Create a food log for the current user from structured food items",
)
def create_food_log(
    food_log_in: schemas.FoodLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    log = crud.create_food_log(db, user_id=current_user.id, food_log_in=food_log_in)
    return log


@router.get(
    "/logs",
    response_model=List[schemas.FoodLogRead],
    summary="Get recent food logs for the current user",
)
def list_food_logs(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    logs = crud.get_food_logs_for_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return logs

