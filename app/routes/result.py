from fastapi import APIRouter, Depends, HTTPException, status
from ..services.file_service import  unzip_files, save_doc_into_db
from ..services.pdf_service import process_pdf
from ..services.openai_service import upload_image_as_message
from ..database.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from ..models import models, schemas
from ..authentication import oauth2
from typing import List

router = APIRouter(
    tags=['project']
)

@router.get('/projects/{file_name}', status_code=200, response_model=schemas.Results)
def show(file_name: str, db: Session = Depends(get_db), current_user: schemas.User = Depends(oauth2.get_current_user)):
    user = db.query(models.User).filter(models.User.email == current_user.email).first()
    document = db.query(models.Document).filter(models.Document.file_name == file_name, models.Document.user_id == user.id).first()
    print("Document id:", document.id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Project with the name {file_name} is not available")

    # Now use the document's id to query the analysis results
    results = db.query(models.AnalysisResult).filter(models.AnalysisResult.document_id == document.id).first()

    if not results:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Analysis results for the project with the name {file_name} are not available")

    return results