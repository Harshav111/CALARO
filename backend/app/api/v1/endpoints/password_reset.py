import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .... import crud, schemas
from ....database import get_db

logger = logging.getLogger(__name__)

router = APIRouter()


from ....utils.email import send_email

@router.post("/request-otp", status_code=200)
async def request_password_reset_otp(
    request: schemas.PasswordResetRequest, db: Session = Depends(get_db)
):
    """
    Requests a password reset OTP to be sent to the user's email.
    """
    user = crud.get_user_by_email(db, email=request.email)
    if not user:
        # In this environment, let's explicitly tell the user they haven't registered this email.
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email addresses."
        )
    
    reset_entry = crud.create_password_reset(db, email=request.email)
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
        <h2 style="color: #1e293b; text-align: center;">Calaro Security</h2>
        <p style="color: #475569; font-size: 16px;">Hello,</p>
        <p style="color: #475569; font-size: 16px;">We received a request to reset your password. Use the verification code below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; padding: 10px 20px; background-color: #e2e8f0; color: #0f172a; border-radius: 6px; letter-spacing: 5px;">{reset_entry.otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in 15 minutes.</p>
        <p style="color: #64748b; font-size: 14px; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
    </div>
    """
    
    await send_email(email_to=request.email, subject="Calaro - Password Reset Code", html_content=html_content)
    
    return {"msg": "If an account with that email exists, an OTP has been sent."}


@router.post("/reset-password", status_code=200)
def reset_password(
    confirm: schemas.PasswordResetConfirm, db: Session = Depends(get_db)
):
    """
    Verifies the OTP and resets the user's password.
    """
    is_valid = crud.verify_and_use_password_reset(db, email=confirm.email, otp=confirm.otp)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP."
        )
    
    # Update the user's password
    crud.update_user_password(db, email=confirm.email, new_password=confirm.new_password)
    
    return {"msg": "Password has been successfully reset."}
