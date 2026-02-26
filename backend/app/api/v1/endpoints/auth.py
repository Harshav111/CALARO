from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .... import crud, models, schemas
from ....core.config import settings
from ....core.security import create_access_token
from ....database import get_db


router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id_or_email: str = payload.get("sub")
        if user_id_or_email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = crud.get_user_by_email(db, email=user_id_or_email)
    if user is None:
        raise credentials_exception
    return user


def get_current_admin_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges",
        )
    return current_user


def _activity_factor(level: Optional[str]) -> Optional[float]:
    if not level:
        return None
    mapping = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9,
    }
    return mapping.get(level)


def calculate_tdee_for_user(user: models.User) -> Optional[float]:
    if not all([user.age, user.height_cm, user.weight_kg, user.sex]):
        return None
    sex = (user.sex or "").lower()
    if sex not in {"male", "female"}:
        return None

    # Mifflin-St Jeor
    bmr = 10 * user.weight_kg + 6.25 * user.height_cm - 5 * user.age
    bmr += 5 if sex == "male" else -161

    factor = _activity_factor(user.activity_level)
    if factor is None:
        return bmr
    return bmr * factor


@router.post("/register", response_model=schemas.UserRead, status_code=201)
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, email=user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )
    user = crud.create_user(db, user_in=user_in)
    return user


@router.post("/login", response_model=schemas.Token)
def login_for_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    user = crud.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserRead)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.get("/profile", response_model=schemas.UserProfile)
def get_profile(current_user: models.User = Depends(get_current_user)):
    tdee = calculate_tdee_for_user(current_user)
    return schemas.UserProfile(
        age=current_user.age,
        height_cm=current_user.height_cm,
        weight_kg=current_user.weight_kg,
        sex=current_user.sex,
        activity_level=current_user.activity_level,
        tdee=tdee,
    )


@router.put("/profile", response_model=schemas.UserProfile)
def update_profile(
    profile_in: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    user = crud.update_user_profile(db, user=current_user, profile_in=profile_in)
    tdee = calculate_tdee_for_user(user)
    return schemas.UserProfile(
        age=user.age,
        height_cm=user.height_cm,
        weight_kg=user.weight_kg,
        sex=user.sex,
        activity_level=user.activity_level,
        tdee=tdee,
    )
