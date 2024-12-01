from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import uuid4
from ..database.database import get_db
from ..models import models
from ..utils.hashing import hash_password
from typing import Dict
from pydantic import BaseModel, EmailStr
from app.services.email_service import send_reset_password_email, send_registration_otp
from app.models.hashing import Hash
from app.models import schemas
from typing import Dict
import time , random
from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.models.token import verify_token
from sqlalchemy.orm import Session
from jose import JWTError

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

# Temporary in-memory storage for reset tokens
reset_tokens: Dict[str, int] = {}
# Temporary storage for OTPs
otp_storage = {}


class ForgetPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str


@router.post("/forget-password/")
async def forget_password(request: ForgetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with this email does not exist"
        )

    # Generate a unique reset token
    reset_token = str(uuid4())
    reset_tokens[reset_token] = user.id  # Map token to user ID

    # Construct reset link with uid/token format
    reset_link = f"http://localhost:3000/reset-password/{user.id}/{reset_token}"

    # Send the reset password email
    subject = "Reset Your Password"
    body = (
        f"Hello {user.email},\n\n"
        "We received a request to reset your password. Click the link below to reset it:\n"
        f"{reset_link}\n\n"
        "If you did not request this, please ignore this email.\n\n"
        "Best regards,\nYour App Team"
    )
    send_reset_password_email(user.email, subject, body)

    return {"message": "Reset password link has been sent to your email."}



@router.post("/reset-password/")
async def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    if data.token not in reset_tokens:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid or expired reset token"
        )

    if data.new_password != data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Passwords do not match"
        )

    # Get the user ID associated with the token
    user_id = reset_tokens.pop(data.token)  # Remove token after use
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )
    # Validate that the new password is not the same as the old password
    if Hash.verify(user.password, data.new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password cannot be the same as the old password"
        )
        
    # Hash the new password and update it
    hashed_password = hash_password(data.new_password)
    user.password = hashed_password
    db.commit()

    return {"message": "Password reset successfully. You can now log in with your new password."}


@router.post("/verify-token")
async def verify_token_endpoint(request: Request, token: str = None):
    auth_header = request.headers.get("Authorization")
    # print(f"Authorization Header: {auth_header}")

    # Use the token from the query parameter if Authorization header is missing
    if not auth_header and not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing or invalid",
        )
    
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        # print(f"Extracted Token: {token}")

    # Proceed to verify the token
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token_data = verify_token(token, credentials_exception)
        return {"isAuthenticated": True, "email": token_data.email}
    except HTTPException as e:
        raise e
    except JWTError:
        raise credentials_exception



class OTPVerificationRequest(BaseModel):
    email: EmailStr
    otp: str
    
class OTPResendRequest(BaseModel):
    email: EmailStr

@router.post("/register")
def register_user(request: schemas.User, db: Session = Depends(get_db)):
    """
    Handles user registration by validating the form data,
    checking password confirmation, and sending an OTP.

    Args:
        request (User): Contains user details including name, email, contact number, and passwords.
        db (Session): Database session dependency.

    Returns:
        JSON response indicating OTP has been sent.
    """
    # Check if user already exists
    user = db.query(models.User).filter(
        (models.User.email == request.email)
    ).first()
    if user:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    # Generate OTP and store user details temporarily
    otp = str(random.randint(100000, 999999))
    expiry = time.time() + 900  # OTP valid for 15 minutes
    otp_storage[request.email] = {
        "otp": otp,
        "expiry": expiry,
        "data": {
            "name": request.name,
            "email": request.email,
            "contact_number": request.contact_number,
            "password": request.password1,  # Store securely after hashing
        },
    }

    # Send OTP via email
    try:
        subject = "Your Registration OTP"
        send_registration_otp(recipient_email=request.email, subject=subject, otp=otp)
    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP.")

    return {"message": "OTP sent to your email. Please verify to complete registration."}


@router.post("/verify-otp")
def verify_otp(request: OTPVerificationRequest, db: Session = Depends(get_db)):
    """
    Verifies the OTP and completes the registration process.

    Args:
        request (OTPVerificationRequest): Contains the email and OTP.
        db (Session): Database session dependency.

    Returns:
        JSON response indicating success or failure.
    """
    stored_otp_data = otp_storage.get(request.email)

    # Validate OTP existence
    if not stored_otp_data:
        raise HTTPException(status_code=404, detail="No OTP found for this email.")

    # Check OTP expiration
    if time.time() > stored_otp_data["expiry"]:
        otp_storage.pop(request.email, None)  # Clean up expired OTP
        raise HTTPException(status_code=400, detail="OTP expired.")

    # Check OTP correctness
    if stored_otp_data["otp"] != request.otp:
        otp_storage.pop(request.email, None)  # Clean up invalid OTP
        raise HTTPException(status_code=400, detail="Invalid OTP.")

    # Retrieve user details from temporary storage
    user_data = stored_otp_data["data"]

    # Hash the password (ensure secure storage)
    hashed_password = Hash.bcrypt(user_data["password"])

    # Register the user
    try:
        new_user = models.User(
            username=user_data["name"],  # Using name as username
            email=user_data["email"],
            contact_number=user_data["contact_number"],
            password=hashed_password,
        )
        db.add(new_user)
        db.commit()

        # Remove OTP after successful verification
        otp_storage.pop(request.email, None)

        return {"message": "Registration successful!"}
    except Exception as e:
        print(f"Error during user registration: {e}")
        raise HTTPException(status_code=500, detail="Failed to register user.")

@router.post("/resend-otp")
def resend_otp(request: OTPResendRequest, db: Session = Depends(get_db)):
    """
    Resends an OTP for email verification during registration.

    Args:
        request (OTPVerificationRequest): Contains the email of the user.
        db (Session): Database session dependency.

    Returns:
        JSON response indicating OTP has been resent.
    """
    stored_otp_data = otp_storage.get(request.email)

    # Check if email exists in temporary storage
    if not stored_otp_data:
        raise HTTPException(status_code=404, detail="No registration process found for this email.")

    # Generate a new OTP
    otp = str(random.randint(100000, 999999))
    expiry = time.time() + 300  # New OTP valid for 5 minutes

    # Update OTP storage
    otp_storage[request.email]["otp"] = otp
    otp_storage[request.email]["expiry"] = expiry

    # Resend OTP via email
    try:
        subject = "Your Resent Registration OTP"
        # Directly pass the required parameters
        send_registration_otp(
            recipient_email=request.email,
            subject=subject,
            otp=otp
        )
    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail="Failed to resend OTP.")

    return {"message": "OTP has been resent to your email. Please verify to complete registration."}