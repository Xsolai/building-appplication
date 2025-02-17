from fastapi import APIRouter, Depends, HTTPException, status
from ..database.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from ..models import models, schemas
from ..authentication import oauth2
from fastapi.encoders import jsonable_encoder

router = APIRouter(
    tags=['project']
)

# @router.get('/projects/{file_name}', status_code=200, response_model=schemas.Results)
# def show(file_name: str, db: Session = Depends(get_db), current_user: schemas.User = Depends(oauth2.get_current_user)):
#     user = db.query(models.User).filter(models.User.email == current_user.email).first()
#     document = db.query(models.Document).filter(
#         models.Document.file_name == file_name, models.Document.user_id == user.id).first()

#     if not document:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
#                             detail=f"Project with the name {file_name} is not available")

#     analysis_results = db.query(models.AnalysisResult).filter(
#         models.AnalysisResult.document_id == document.id).first()
#     compliance_status = db.query(models.ComplianceStatus).filter(
#         models.ComplianceStatus.document_id == document.id).order_by(models.ComplianceStatus.id.desc()).first()

#     if not analysis_results and not compliance_status:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
#                             detail=f"Analysis results for the project with the name {file_name} are not available")
    
#     # if compliance_status and not analysis_results:
#     #     # Prepare analysis_result excluding 'document_id' and 'id'
#     #     results = {
#     #         "compliance_status": compliance_status.status,
#     #         "analysis_result": None,  # Excludes 'document_id' and 'id'
#     #         "non_compliant_details": compliance_status.details
#     #     }

#     #     return results
    
#     # elif compliance_status:
#     if compliance_status:
#         analysis_result_data = jsonable_encoder(analysis_results)
#         analysis_result_data.pop("document_id", None)
#         analysis_result_data.pop("id", None)
#         return {
#             "compliance_status": compliance_status.status,
#             "analysis_result": analysis_result_data,
#             "non_compliant_details": compliance_status.details
#         }
        
#     else:
#         analysis_result_data = jsonable_encoder(analysis_results)
#         return {
#             "compliance_status": None,
#             "analysis_result": analysis_result_data,  # Excludes 'document_id' and 'id'
#             "non_compliant_details": None
#         }

@router.get('/projects/{file_name}', status_code=200)
def show(file_name: str, db: Session = Depends(get_db), current_user: schemas.User = Depends(oauth2.get_current_user)):
    user = db.query(models.User).filter(models.User.email == current_user.email).first()
    document = db.query(models.Document).filter(
        models.Document.file_name == file_name, models.Document.user_id == user.id).first()

    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Project with the name {file_name} is not available")

    analysis_results = db.query(models.AnalysisResult).filter(
        models.AnalysisResult.document_id == document.id).first()
    compliance_status = db.query(models.ComplianceStatus).filter(
        models.ComplianceStatus.document_id == document.id).order_by(models.ComplianceStatus.id.desc()).first()

    if not analysis_results and not compliance_status:
        # raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
        #                     detail=f"Analysis results for the project with the name {file_name} are not available")
        return {
            "document_id": document.id,
            "doc_name": document.file_name
        }
    
    # Prepare analysis_result excluding 'document_id' and 'id'
    analysis_result_data = jsonable_encoder(analysis_results)
    analysis_result_data.pop("document_id", None)
    analysis_result_data.pop("id", None)

    duration = analysis_result_data.get("duration")
    analysis_result_data.pop("duration")

    if compliance_status:
        results = {
            "completed": document.uploaded_at,
            "pending": round(duration, 2),
            "compliance_status": compliance_status.status,
            "analysis_result": analysis_result_data,
            "non_compliant_details": compliance_status.details
        }
    else:
        results = {
            "completed": document.uploaded_at,
            "pending": round(duration, 2), 
            "compliance_status": None,
            "analysis_result": analysis_result_data,
            "non_compliant_details": None,
        }

    return results