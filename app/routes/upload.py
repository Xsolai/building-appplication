from fastapi import APIRouter, File, UploadFile, HTTPException, status
import os, time
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
from fastapi.encoders import jsonable_encoder
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
        # Validate file type (only .zip allowed)
        if not file.filename.endswith(".zip"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only .zip files are allowed."
            )

        
        start_time = time.time()
        logging.info(start_time)
        user = db.query(models.User).filter(models.User.email == current_user.email).first()
        # # Send email notification to the system admin
        # user_email = user.email
        # user_name = user.username
        # send_email_notification(user_email=user_email, user_name=user_name)
        # logging.info("Email notification sent to the system admin.")

        file_name = file.filename.split(".")[0]
        
        # if db.query(models.Document).filter(models.Document.file_name == file_name, models.Document.user_id == user.id).first():
        #     return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"File with the name {file_name} already exists. Try reloading a file with the different name.")
        # else:
        # Send email notification to the system admin
        user_email = user.email
        user_name = user.username
        send_email_notification(user_email=user_email, user_name=user_name)
        logging.info("Email notification sent to the system admin.")
        file_path:str = os.path.join(CURRENT_DIR,str(user.id), file_name, f"zip")
        img_folder = os.path.join(CURRENT_DIR, str(user.id), file_name, "images", "Project_images")
        #creating folders
        os.makedirs(CURRENT_DIR,exist_ok=True)
        os.makedirs(file_path, exist_ok=True)
        os.makedirs(img_folder, exist_ok=True)
        with open(os.path.join(file_path, file.filename), "wb") as buffer:
            buffer.write(await file.read())
        print("File_name = ", file.filename.split(".")[0])
        
        # doc_id = save_doc_into_db(db=db, filename=file.filename.split(".")[0] , user_id=user.id)
        # logging.info(f"Documnet Id is: {doc_id}")
            
        logging.info("unzipping all the files")
        unzip_files(os.path.join(file_path, file.filename), os.path.join(CURRENT_DIR, str(user.id), file_name, "pdfs"))
        logging.info("unzipped done")
        
        # project_name = ("".join(os.listdir(os.path.join(CURRENT_DIR,"zip")))).split(".")[0]
        project_name = file.filename.split(".")[0]
        print("zip name",project_name)
        
        
        # Threaded PDF processing
        pdf_files = os.listdir(os.path.join(CURRENT_DIR, str(user.id), file_name, "pdfs", project_name))
        logging.info("Starting PDF to image conversion")
        
        def process_file(file):
            return process_pdf(
                os.path.join(CURRENT_DIR, str(user.id), file_name, "pdfs", project_name, file),
                folder_path=img_folder,
                project_name=file_name
            )

        for file in pdf_files:
            process_file(file)

        logging.info("Converted PDFs to images successfully")
        
        logging.info("sending images to gpt")
        response = extracting_project_details(images_path=img_folder)
        logging.info("response:", response)
        
        end_time = time.time()  # Record end time
        total_time = (end_time - start_time) / 60
        print("Total Time: ", total_time)
        logging.info(f"Total processing time: {total_time:.2f} seconds")
        
        doc_id = save_doc_into_db(db=db, filename=project_name , user_id=user.id)
        # logging.info(f"Documnet Id is: {doc_id}")
        save_analysis_into_db(db=db, response=response, duration = total_time,  doc_id = doc_id)

        return response

    except Exception as e:
        logging.error(f"Internal server error: {e}")
        return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get('/projects/', response_model=List[schemas.Projects])
def all(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(oauth2.get_current_user)
):
    # Get the current user
    user = db.query(models.User).filter(models.User.email == current_user.email).first()

    # Query all projects for the user
    projects = db.query(models.Document).filter(models.Document.user_id == user.id).all()

    if not projects:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No projects are uploaded yet."
        )

    # Add compliance status for each project
    response = []
    for project in projects:
        compliance_status = db.query(models.ComplianceStatus).filter(
            models.ComplianceStatus.document_id == project.id
        ).first()

        # Construct response data
        project_data = jsonable_encoder(project)
        project_data["status"] = compliance_status.status if compliance_status else "inBearbeitung"
        response.append(project_data)

    return response