from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database.database import get_db
from ..models import models, schemas
from ..services.email_service import send_thank_you_email
from ..authentication.oauth2 import get_current_user
import random
import string

router = APIRouter(
    tags=["Feedback"]
)

# Utility function to generate a random voucher code
def generate_voucher_code(length=10):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


# # make the save-feeback with current user
# @router.post("/save-feedback/", response_model=schemas.FeedbackResponse)
# async def save_feedback(feedback: schemas.FeedbackCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
#     try:
#         # Generate a random voucher code
#         voucher_code = generate_voucher_code()
        
#         user = db.query(models.User).filter(models.User.email == current_user.email).first()
#         # Retrieve the latest project for the user
#         latest_project = db.query(models.Document).filter(models.Document.user_id == user.id).order_by(models.Document.uploaded_at.desc()).first()

#         # Save the voucher in the database
#         new_voucher = models.Voucher(
#             code=voucher_code,
#             is_used=False
#         )
#         db.add(new_voucher)
#         db.commit()
#         db.refresh(new_voucher)

#         # Save the feedback in the database
#         new_feedback = models.Feedback(
#             user_id=current_user.id,
#             feedback_text=feedback.feedback_text,
#             voucher_code=voucher_code,
#             document_id = latest_project.id
#         )
#         db.add(new_feedback)
#         db.commit()
#         db.refresh(new_feedback)

#         # Send a thank-you email to the user with the voucher code
#         subject = "Thank You for Your Feedback!"
#         body = (
#             f"Dear {current_user.email},\n\n"
#             f"Thank you for providing your valuable feedback on {latest_project.file_name}!\n"
#             f"As a token of our appreciation, here is your voucher code: {voucher_code}\n"
#             "You can use this code for your next submission.\n\n"
#             "Best Regards,\n"
#             "Fire Protection Review Team"
#         )
#         send_thank_you_email(current_user.email, subject, body)

#         return {"message": "Feedback submitted successfully!", "voucher_code": voucher_code}

#     except Exception as e:
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/{project_name}/feedback", response_model=schemas.FeedbackResponse)
async def save_feedback(
    project_name: str, 
    feedback: schemas.FeedbackCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    try:
        # Generate a random voucher code
        voucher_code = generate_voucher_code()
        
        # Find the user by email (from token)
        user = db.query(models.User).filter(models.User.email == current_user.email).first()
        
        # Retrieve the latest project based on project name and user
        latest_project = db.query(models.Document).filter(
            models.Document.user_id == user.id,
            models.Document.file_name == project_name
        ).order_by(models.Document.uploaded_at.desc()).first()

        if not latest_project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Save the voucher in the database
        new_voucher = models.Voucher(
            code=voucher_code,
            is_used=False
        )
        db.add(new_voucher)
        db.commit()
        db.refresh(new_voucher)

        # Save the feedback in the database
        new_feedback = models.Feedback(
            user_id=current_user.id,
            feedback_text=feedback.feedback_text,
            voucher_code=voucher_code,
            document_id=latest_project.id
        )
        db.add(new_feedback)
        db.commit()
        db.refresh(new_feedback)

        # Send a thank-you email
        subject = "Thank You for Your Feedback!"
        body = (
            f"Dear {current_user.email},\n\n"
            f"Thank you for providing your valuable feedback on {project_name}!\n"
            f"As a token of our appreciation, here is your voucher code: {voucher_code}\n"
            "You can use this code for your next submission.\n\n"
            "Best Regards,\n"
            "Fire Protection Review Team"
        )
        send_thank_you_email(current_user.email, subject, body)

        return {"message": "Feedback submitted successfully!", "voucher_code": voucher_code}

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/get-feedbacks/", response_model=List[schemas.FeedbackResponse])
async def get_feedbacks(db: Session = Depends(get_db)):
    try:
        feedbacks = db.query(models.Feedback).all()
        if not feedbacks:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No feedbacks found")

        feedback_list = [
            {"message": feedback.feedback_text, "voucher_code": feedback.voucher_code}
            for feedback in feedbacks
        ]

        return feedback_list

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
