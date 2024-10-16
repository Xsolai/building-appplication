from fastapi import APIRouter, Depends, status, HTTPException
from ..models import schemas, models, token
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..models.hashing import Hash
from ..authentication import oauth2
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(
    tags=['users']
)

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



@router.post("/registration", response_model=schemas.ShowUser, status_code=status.HTTP_201_CREATED, tags=['users'])
async def registration(request: schemas.User, db: Session = Depends(get_db)):
    if request.password1 != request.password2:
        raise ValueError("Passwords do not match")
    new_user = models.User(
        username = request.name,
        email = request.email,
        contact_number = request.contact_number,
        password = Hash.bcrypt(request.password1)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
 
    
@router.put("/update-profile", response_model=schemas.ShowUser, status_code=status.HTTP_200_OK, tags=['users'])
async def update_profile(
    request: schemas.UpdateUser, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(oauth2.get_current_user)):

    # Fetch the user from the database
    user = db.query(models.User).filter(models.User.email == current_user.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with the email {current_user.email} is not found"
        )

    # Update user attributes conditionally if provided in the request
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
    
    # Email is sensitive; ensure uniqueness if the user requests an email change
    if request.email and request.email != user.email:
        # Check if the new email already exists
        if db.query(models.User).filter(models.User.email == request.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already in use"
            )
        user.email = request.email

    # Commit the changes to the database
    db.commit()
    db.refresh(user)
    return user