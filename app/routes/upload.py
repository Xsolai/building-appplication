from fastapi import APIRouter, File, UploadFile, HTTPException, status
import os
import logging
from ..services.file_service import  unzip_files, save_doc_into_db, save_analysis_into_db
from ..services.pdf_service import process_pdf
from ..services.openai_service import extracting_project_details
from ..database.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from ..models import models, schemas
from ..authentication import oauth2
from typing import List
from concurrent.futures import ThreadPoolExecutor, as_completed

CURRENT_DIR = os.path.join(os.getcwd(), "uploads")
router = APIRouter(
    tags=['project']
)

@router.post('/upload/')
@router.post('/upload/')
async def upload_file(file: UploadFile = File(...),  db: Session = Depends(get_db),  current_user: schemas.User = Depends(oauth2.get_current_user)):

    try:
        user = db.query(models.User).filter(models.User.email == current_user.email).first()
        file_path:str = os.path.join(CURRENT_DIR, f"zip")
        img_folder = os.path.join(CURRENT_DIR, "images")
        #creating folders
        os.makedirs(CURRENT_DIR,exist_ok=True)
        os.makedirs(file_path, exist_ok=True)
        os.makedirs(img_folder, exist_ok=True)
        with open(os.path.join(file_path, file.filename), "wb") as buffer:
            buffer.write(await file.read())
        print("File_name = ", file.filename.split(".")[0])
        
        doc_id = save_doc_into_db(db=db, filename=file.filename.split(".")[0] , user_id=user.id)
        logging.info(f"Documnet Id is: {doc_id}")
            
        logging.info("unzipping all the files")
        unzip_files(os.path.join(file_path, file.filename), os.path.join(CURRENT_DIR, "pdfs"))
        logging.info("unzipped done")
        
        project_name = ("".join(os.listdir(os.path.join(CURRENT_DIR,"zip")))).split(".")[0]
        print("zip name",project_name)

        # Create a new folder for the extracted images
        folders = len(os.listdir(img_folder))
        images_dir = os.path.join(img_folder, str(folders)) if folders > 0 else os.path.join(img_folder, "0")
        print("images folder", images_dir)
        os.makedirs(images_dir, exist_ok=True)
        
        
        # Threaded PDF processing
        pdf_files = os.listdir(os.path.join(CURRENT_DIR, "pdfs", project_name))
        logging.info("Starting PDF to image conversion")
        
        def process_file(file):
            return process_pdf(
                os.path.join(CURRENT_DIR, "pdfs", project_name, file),
                folder_path=images_dir,
                project_name=project_name
            )

        # Use ThreadPoolExecutor for concurrent processing
        with ThreadPoolExecutor(max_workers= len(pdf_files)) as executor:
            futures = [executor.submit(process_file, file) for file in pdf_files]
            result = [future.result() for future in as_completed(futures)]

        logging.info("Converted PDFs to images successfully")
        
        logging.info("sending images to gpt")
        response = extracting_project_details(images_path=images_dir)
        logging.info("response:", response)
        
        save_analysis_into_db(response,  doc_id)
        return response
        
    except Exception as e:
        return f"Internal server Error: {e}"

@router.get('/projects/', response_model=List[schemas.Projects])
def all(db: Session = Depends(get_db), current_user: schemas.User = Depends(oauth2.get_current_user)):
    user = db.query(models.User).filter(models.User.email == current_user.email).first()
    # print("user", user.id)
    projects = db.query(models.Document).filter(models.Document.user_id == user.id).all()
    if not projects:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"No Projects are uploaded yet.")
    return projects
