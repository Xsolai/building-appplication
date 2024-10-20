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
from typing import List

CURRENT_DIR = os.path.join(os.getcwd(), "uploads")
router = APIRouter(
    tags=['project']
)

@router.post('/upload-B-Plan/')
async def upload_file(file: UploadFile = File(...),  db: Session = Depends(get_db), current_user: schemas.User = Depends(oauth2.get_current_user)):

    try:
        file_path:str = os.path.join(CURRENT_DIR, f"B-plan")
        images_path = os.path.join(CURRENT_DIR, "images")
        #creating folders
        os.makedirs(file_path,exist_ok=True)
        with open(os.path.join(file_path, file.filename), "wb") as buffer:
            buffer.write(await file.read())
        print("File_name = ", file.filename.split(".")[0])

        result = [process_plan_pdf(os.path.join(file_path, file), current_dir= file_path, project_name="B-plan") for file in os.listdir(os.path.join(file_path))]
        logging.info("converted to images Done")
        
        logging.info("sending images to gpt")
        response = check_compliance(images_path=images_path)
        logging.info("response:", response)

        return Response(content=response)
        
    except Exception as e:
        return f"Internal server Error: {e}"
