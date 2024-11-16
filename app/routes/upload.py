from fastapi import APIRouter, File, UploadFile, HTTPException, status
import os
import logging
from ..services.file_service import unzip_files, save_doc_into_db, save_analysis_into_db
from ..services.pdf_service import process_pdf
from ..services.openai_service import extracting_project_details
from ..database.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from ..models import models, schemas
from ..authentication import oauth2
from typing import List
from concurrent.futures import ThreadPoolExecutor, as_completed
from ..utils.email_sender import send_email_notification

CURRENT_DIR = os.path.join(os.getcwd(), "uploads")
router = APIRouter(tags=['project'])

@router.post('/upload/')
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(oauth2.get_current_user)
):
    try:
        # Send email notification to the system admin
        user_email = current_user.email
        user_name = current_user.username
        send_email_notification(user_email=user_email, user_name=user_name)
        logging.info("Email notification sent to the system admin.")

        
        file_path: str = os.path.join(CURRENT_DIR, "zip")
        img_folder = os.path.join(CURRENT_DIR, "images")

        # Creating folders
        os.makedirs(CURRENT_DIR, exist_ok=True)
        os.makedirs(file_path, exist_ok=True)
        os.makedirs(img_folder, exist_ok=True)

        # Save the uploaded file
        with open(os.path.join(file_path, file.filename), "wb") as buffer:
            buffer.write(await file.read())
        logging.info(f"File uploaded: {file.filename}")

        # Save document information to the database
        doc_id = save_doc_into_db(db=db, filename=file.filename.split(".")[0], user_id=current_user.id)
        logging.info(f"Document ID: {doc_id}")

        # Unzip the uploaded file
        logging.info("Unzipping files...")
        unzip_files(os.path.join(file_path, file.filename), os.path.join(CURRENT_DIR, "pdfs"))
        logging.info("Unzipping completed.")

        # Determine the project name
        project_name = ("".join(os.listdir(os.path.join(CURRENT_DIR, "zip")))).split(".")[0]
        logging.info(f"Project name: {project_name}")

        # Prepare the folder for extracted images
        folders = len(os.listdir(img_folder))
        images_dir = os.path.join(img_folder, str(folders)) if folders > 0 else os.path.join(img_folder, "0")
        os.makedirs(images_dir, exist_ok=True)

        # Process PDF files
        pdf_files = os.listdir(os.path.join(CURRENT_DIR, "pdfs", project_name))
        logging.info("Starting PDF to image conversion...")

        def process_file(file):
            return process_pdf(
                os.path.join(CURRENT_DIR, "pdfs", project_name, file),
                folder_path=images_dir,
                project_name=project_name
            )
        
      
        # Process each PDF file
        for file in pdf_files:
            process_file(file)

        logging.info("PDF to image conversion completed.")

        # Extract project details using OpenAI service
        logging.info("Sending images to GPT for analysis...")
        response = extracting_project_details(images_path=images_dir)
        logging.info(f"GPT response: {response}")

        # Save analysis results to the database
        save_analysis_into_db(db, response, doc_id)

        

        return response

    except Exception as e:
        logging.error(f"Internal server error: {e}")
        return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get('/projects/', response_model=List[schemas.Projects])
def all(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(oauth2.get_current_user)
):
    user = db.query(models.User).filter(models.User.email == current_user.email).first()
    projects = db.query(models.Document).filter(models.Document.user_id == user.id).all()

    if not projects:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No projects are uploaded yet."
        )

    return projects
