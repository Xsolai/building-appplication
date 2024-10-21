from fastapi import APIRouter, File, UploadFile, HTTPException, status, Response
import os
import logging
from ..services.pdf_service import process_pdf, process_plan_pdf
from ..services.openai_service import check_compliance
from ..database.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from ..models import models, schemas
from ..authentication import oauth2
import shutil

CURRENT_DIR = os.path.join(os.getcwd(), "uploads")
router = APIRouter(
    tags=['project']
)

@router.post('/upload-B-Plan/')
async def upload_file(file: UploadFile = File(...),  db: Session = Depends(get_db)):

    try:
        file_path:str = os.path.join(CURRENT_DIR, f"B-plan")
        B_plan_images_path = os.path.join(file_path, "images")
        #creating folders
        os.makedirs(file_path,exist_ok=True)
        os.makedirs(B_plan_images_path,exist_ok=True)
        
        images_dir = os.listdir(os.path.join(CURRENT_DIR, "images"))
        images_path = os.path.join(CURRENT_DIR, "images", images_dir[-1])
        print("Images path", images_path)
        
        saved_file_path = os.path.join(file_path, file.filename)
        with open(os.path.join(file_path, file.filename), "wb") as buffer:
            buffer.write(await file.read())
        print("File_name = ", file.filename.split(".")[0])

        result = process_plan_pdf(os.path.join(saved_file_path), folder_path= B_plan_images_path, project_name="B-plan")
        logging.info("converted to images Done")
        
        logging.info("sending images to gpt")
        response = check_compliance(images_path=images_path)
        logging.info("response: %s", response)

        return Response(response)
        
    except Exception as e:
        return f"Internal server Error: {e}"

    finally:
        shutil.rmtree(file_path)
