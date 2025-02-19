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
    compliance_status = db.query(models.ComplianceDetails).filter(
        models.ComplianceDetails.document_id == document.id).order_by(models.ComplianceDetails.id.desc()).first()
    project_details = db.query(models.ProjectDetails).filter(
        models.ProjectDetails.document_id == document.id).order_by(models.ProjectDetails.id.desc()).first()

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

    compliance_details_data = {
        "compliant_status": compliance_status.compliant_status if compliance_status else None,
        "location_within_building_zone": compliance_status.location_within_building_zone if compliance_status else None,
        "building_use_type": compliance_status.building_use_type if compliance_status else None,
        "building_style": compliance_status.building_style if compliance_status else None,
        "grz": compliance_status.grz if compliance_status else None,
        "gfz": compliance_status.gfz if compliance_status else None,
        "building_height": compliance_status.building_height if compliance_status else None,
        "number_of_floors": compliance_status.number_of_floors if compliance_status else None,
        "roof_shape": compliance_status.roof_shape if compliance_status else None,
        "dormers": compliance_status.dormers if compliance_status else None,
        "roof_orientation": compliance_status.roof_orientation if compliance_status else None,
        "parking_spaces": compliance_status.parking_spaces if compliance_status else None,
        "outdoor_space": compliance_status.outdoor_space if compliance_status else None,
        "setback_area": compliance_status.setback_area if compliance_status else None,
        "setback_relevant_filling_work": compliance_status.setback_relevant_filling_work if compliance_status else None,
        "deviations_from_b_plan": compliance_status.deviations_from_b_plan if compliance_status else None,
        "exemptions_required": compliance_status.exemptions_required if compliance_status else None,
        "species_protection_check": compliance_status.species_protection_check if compliance_status else None,
        "compliance_with_zoning_rules": compliance_status.compliance_with_zoning_rules if compliance_status else None,
        "compliance_with_building_codes": compliance_status.compliance_with_building_codes if compliance_status else None
    }

    results = {
        "completed": document.uploaded_at,
        "duration": round(duration, 2) if duration else None,
        "compliance_status": compliance_details_data,
        "analysis_result": analysis_result_data,
        # "non_compliant_details": compliance_status.details if compliance_status else None,
        "latitude": project_details.latitude if project_details else None,
        "longitude": project_details.longitude if project_details else None
    }

    return results