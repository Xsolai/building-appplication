from fastapi import APIRouter, Depends, status, HTTPException
from ..models import schemas, models, token
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..models.hashing import Hash
from ..authentication import oauth2
from fastapi.security import OAuth2PasswordRequestForm
import re
import logging

router = APIRouter(
    tags=['users']
)

def is_valid_email(email: str) -> bool:
    """
    Validate the email address format using a robust regex.
    Ensures a proper domain and top-level domain is present.
    """
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None


def is_strong_password(password: str) -> bool:
    """
    Check if the password is strong:
    - At least 8 characters long
    - Contains both letters and numbers
    - Contains at least one special character
    """
    if len(password) < 8:
        return False
    if not re.search(r'[A-Za-z]', password):  # Check for letters
        return False
    if not re.search(r'\d', password):  # Check for digits
        return False
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):  # Check for special characters
        return False
    return True

@router.post('/login')
async def login(request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.email == request.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Invalid Credentials")
    if not Hash.verify(user.password, request.password):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Incorrect password")

    access_token = token.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


# @router.post("/registration", response_model=schemas.ShowUser, status_code=status.HTTP_201_CREATED, tags=['users'])
# async def registration(request: schemas.User, db: Session = Depends(get_db)):
#     """
#     Endpoint for user registration with email and password validation.
#     """
#     try:
#         # Check if passwords match
#         if request.password1 != request.password2:
#             raise HTTPException(status_code=400, detail="Passwords do not match")
        
#         # Validate email
#         if not is_valid_email(request.email):
#             raise HTTPException(status_code=400, detail="Invalid email address format")
        
#         # Validate password strength
#         if not is_strong_password(request.password1):
#             raise HTTPException(
#                 status_code=400,
#                 detail="Password must be at least 8 characters long, contain letters, numbers, and special characters"
#             )
        
#         # Check if email is already registered
#         existing_user = db.query(models.User).filter(models.User.email == request.email).first()
#         if existing_user:
#             raise HTTPException(status_code=400, detail="Email already registered")
        
#         # Create new user
#         new_user = models.User(
#             username=request.name,
#             email=request.email,
#             contact_number=request.contact_number,
#             password=Hash.bcrypt(request.password1)  # Encrypt password
#         )
#         db.add(new_user)
#         db.commit()
#         db.refresh(new_user)
#         return new_user

#     except HTTPException as http_err:
#         raise http_err
#     except Exception as err:
#         # Log the error for debugging (optional)
#         logging.error(f"Error during user registration: {err}")
#         raise HTTPException(
#             status_code=500,
#             detail="An internal server error occurred. Please try again later."
#         )
 
    
@router.get("/update-profile", response_model=schemas.ShowUser, status_code=status.HTTP_200_OK, tags=['users'])
async def get_profile(
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(oauth2.get_current_user)
):
    # Fetch the user from the database
    user = db.query(models.User).filter(models.User.email == current_user.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with the email {current_user.email} is not found"
        )
    
    # Return all user fields
    return {
        "username": user.username,
        "email": user.email,
        "title": user.title,
        "organization": user.organization,
        "work_phone": user.work_phone,
        "contact_number": user.contact_number
    }


@router.put("/update-profile", response_model=schemas.ShowUser, status_code=status.HTTP_200_OK, tags=['users'])
async def update_profile(
    request: schemas.UpdateUser, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(oauth2.get_current_user)
):
    # Fetch the user from the database
    user = db.query(models.User).filter(models.User.email == current_user.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with the email {current_user.email} is not found"
        )

    # Update user attributes conditionally
    if request.username:
        user.username = request.username
    if request.title:
        user.title = request.title
    if request.organization:
        user.organization = request.organization
    if request.work_phone:
        user.work_phone = request.work_phone
    if request.contact_number:
        user.contact_number = request.contact_number
    
    # Handle email changes
    if request.email and request.email != user.email:
        if db.query(models.User).filter(models.User.email == request.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already in use"
            )
        user.email = request.email

    # Commit changes to the database
    db.commit()
    db.refresh(user)

    # Return updated user with all fields
    return {
        "username": user.username,
        "email": user.email,
        "title": user.title,
        "organization": user.organization,
        "work_phone": user.work_phone,
        "contact_number": user.contact_number
    }