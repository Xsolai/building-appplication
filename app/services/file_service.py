import os
import zipfile
from ..models import models
from datetime import datetime

def unzip_files(extracted_from, extracted_to):
    """
    Extract files from a ZIP archive. If the ZIP contains folders, process them to find PDFs or nested folders.
    
    Args:
        extracted_from (str): Path to the ZIP file to extract from.
        extracted_to (str): Path to the directory to extract files to.
    """
    def extract_nested_zip(file, current_path):
        """
        Handle nested ZIP files and extract PDFs if present.
        """
        for member in file.namelist():
            member = member.strip()
            
            # Skip '__MACOSX' folders
            if member.startswith('__MACOSX'):
                continue
            
            # Extract each file to the target directory
            file.extract(member, path=current_path)

            # Full path of the extracted file/folder
            extracted_path = os.path.join(current_path, member)

            # If extracted path is a folder, process its contents
            if os.path.isdir(extracted_path):
                print(f"Entering folder: {extracted_path}")
                # Recursively handle nested directories
                process_directory(extracted_path)
            elif member.lower().endswith('.pdf'):
                print(f"PDF Found: {extracted_path}")

    def process_directory(directory_path):
        """
        Look for files/folders in the extracted directory and process them.
        """
        for root, dirs, files in os.walk(directory_path):
            # If PDFs are found, log them
            for file in files:
                if file.lower().endswith('.pdf'):
                    print(f"PDF Found: {os.path.join(root, file)}")

            # Process each nested folder
            for dir_name in dirs:
                dir_path = os.path.join(root, dir_name)
                print(f"Processing nested folder: {dir_path}")

    os.makedirs(extracted_to, exist_ok=True)
    
    try:
        with zipfile.ZipFile(extracted_from, 'r') as zip_file:
            # Extract files and process them
            extract_nested_zip(zip_file, extracted_to)
        
        print(f"Files successfully extracted to {extracted_to}")
    except zipfile.BadZipFile:
        print(f"Error: {extracted_from} is not a valid ZIP file.")
    except Exception as e:
        print(f"An error occurred: {e}")


# def unzip_files(extracted_from, extracted_to):
#     os.makedirs(extracted_to, exist_ok=True)
#     try:
#         with zipfile.ZipFile(extracted_from, 'r') as file:
#             # zip_ref.extractall(extracted_to)
#             # print("namelist", file.namelist())
#             for member in file.namelist():
#                 member = member.strip()
#                 # print(member)
#                 # Extract each file individually, ensuring proper encoding
#                 file.extract(member, path=extracted_to)
                
#                 # This step ensures filenames retain special characters
#                 extracted_path = os.path.join(extracted_to, member)
                
#                 # Rename the extracted file to match the original filename
#                 original_path = os.path.join(extracted_to, member)
#                 if original_path != extracted_path:
#                     os.rename(original_path, extracted_path)
#         print(f"Files successfully extracted to {extracted_to}")
#     except zipfile.BadZipFile:
#         print(f"Error: {extracted_from} is not a valid zip file.")
#     except Exception as e:
#         print(f"An error occurred: {e}")


def save_doc_into_db(db, filename:str=None, user_id:int = None):
    new_file = models.Document(
        file_name = filename,
        uploaded_at = datetime.now(),
        user_id =  user_id
        
    )
    db.add(new_file)
    db.commit()
    db.refresh(new_file)
    return new_file.id

def save_analysis_into_db(db, response, duration, doc_id:int = None):
    new_analysis = models.AnalysisResult(
            result_data = response,
            duration = duration,
            document_id = doc_id
            
        )
    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)
    return new_analysis.id

def save_compliance_into_db(db, status, details, doc_id:int = None):
    new_analysis = models.ComplianceStatus(
            status = status,
            details = details,
            document_id = doc_id
            
        )
    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)
    return new_analysis.id


def save_project_details_into_db(
    db,
    user_id: int,
    document_id: int,
    location_within_building_zone: str = None,
    building_use_type: str = None,
    building_style: str = None,
    grz: str = None,
    gfz: str = None,
    building_height: str = None,
    number_of_floors: str = None,
    roof_shape: str = None,
    dormers: str = None,
    roof_orientation: str = None,
    parking_spaces: str = None,
    outdoor_space: str = None,
    setback_area: str = None,
    setback_relevant_filling_work: str = None,
    deviations_from_b_plan: str = None,
    exemptions_required: str = None,
    species_protection_check: str = None,
    compliance_with_zoning_rules: str = None,
    compliance_with_building_codes: str = None,
    latitude: str = None,
    longitude: str = None,
):
    # Create a new instance of ProjectDetails
    new_project_details = models.ProjectDetails(
        user_id=user_id,
        document_id=document_id,
        latitude=latitude,
        longitude=longitude,
        location_within_building_zone=location_within_building_zone,
        building_use_type=building_use_type,
        building_style=building_style,
        grz=grz,
        gfz=gfz,
        building_height=building_height,
        number_of_floors=number_of_floors,
        roof_shape=roof_shape,
        dormers=dormers,
        roof_orientation=roof_orientation,
        parking_spaces=parking_spaces,
        outdoor_space=outdoor_space,
        setback_area=setback_area,
        setback_relevant_filling_work=setback_relevant_filling_work,
        deviations_from_b_plan=deviations_from_b_plan,
        exemptions_required=exemptions_required,
        species_protection_check=species_protection_check,
        compliance_with_zoning_rules=compliance_with_zoning_rules,
        compliance_with_building_codes=compliance_with_building_codes
    )
    
    # Add the record to the session
    db.add(new_project_details)
    db.commit()
    db.refresh(new_project_details)
    return new_project_details.id

def save_bplan_into_db(db, bplan_name:str=None, user_id:int = None, doc_id:str = None):
    new_file = models.BPlan(
        file_name = bplan_name,
        uploaded_at = datetime.now(),
        user_id =  user_id,
        document_id = doc_id
        
    )
    db.add(new_file)
    db.commit()
    db.refresh(new_file)
    return new_file.id

def save_bplan_details_into_db(
    db,
    user_id: int,
    document_id: int,
    bplan_id: int,
    duration:float,
    location_within_building_zone: str = None,
    building_use_type: str = None,
    building_style: str = None,
    grz: str = None,
    gfz: str = None,
    building_height: str = None,
    number_of_floors: str = None,
    roof_shape: str = None,
    dormers: str = None,
    roof_orientation: str = None,
    parking_spaces: str = None,
    outdoor_space: str = None,
    setback_area: str = None,
    setback_relevant_filling_work: str = None,
    deviations_from_b_plan: str = None,
    exemptions_required: str = None,
    species_protection_check: str = None,
    compliance_with_zoning_rules: str = None,
    compliance_with_building_codes: str = None
):
    # Create a new instance of ProjectDetails
    new_project_details = models.BPlanDetails(
        user_id=user_id,
        document_id=document_id,
        bplan_id=bplan_id,
        duration=duration,
        location_within_building_zone=location_within_building_zone,
        building_use_type=building_use_type,
        building_style=building_style,
        grz=grz,
        gfz=gfz,
        building_height=building_height,
        number_of_floors=number_of_floors,
        roof_shape=roof_shape,
        dormers=dormers,
        roof_orientation=roof_orientation,
        parking_spaces=parking_spaces,
        outdoor_space=outdoor_space,
        setback_area=setback_area,
        setback_relevant_filling_work=setback_relevant_filling_work,
        deviations_from_b_plan=deviations_from_b_plan,
        exemptions_required=exemptions_required,
        species_protection_check=species_protection_check,
        compliance_with_zoning_rules=compliance_with_zoning_rules,
        compliance_with_building_codes=compliance_with_building_codes
    )
    
    # Add the record to the session
    db.add(new_project_details)
    db.commit()
    db.refresh(new_project_details)
    return new_project_details.id

def save_cmp_details_into_db(
    db,
    compliant_status: str,
    user_id: int,
    document_id: int,
    bplan_id: int,
    proj_detail_id: int,
    bplan_detail_id: int,
    location_within_building_zone = None,
    building_use_type = None,
    building_style = None,
    grz = None,
    gfz = None,
    building_height = None,
    number_of_floors = None,
    roof_shape = None,
    dormers = None,
    roof_orientation = None,
    parking_spaces = None,
    outdoor_space = None,
    setback_area = None,
    setback_relevant_filling_work = None,
    deviations_from_b_plan = None,
    exemptions_required = None,
    species_protection_check = None,
    compliance_with_zoning_rules = None,
    compliance_with_building_codes = None
):
    # Create a new instance of ProjectDetails
    new_cmp_details = models.ComplianceDetails(
        compliant_status=compliant_status,
        user_id=user_id,
        document_id=document_id,
        bplan_id=bplan_id,
        project_details_id=proj_detail_id,
        bplan_details_id=bplan_detail_id,
        location_within_building_zone=location_within_building_zone,
        building_use_type=building_use_type,
        building_style=building_style,
        grz=grz,
        gfz=gfz,
        building_height=building_height,
        number_of_floors=number_of_floors,
        roof_shape=roof_shape,
        dormers=dormers,
        roof_orientation=roof_orientation,
        parking_spaces=parking_spaces,
        outdoor_space=outdoor_space,
        setback_area=setback_area,
        setback_relevant_filling_work=setback_relevant_filling_work,
        deviations_from_b_plan=deviations_from_b_plan,
        exemptions_required=exemptions_required,
        species_protection_check=species_protection_check,
        compliance_with_zoning_rules=compliance_with_zoning_rules,
        compliance_with_building_codes=compliance_with_building_codes
    )
    
    # Add the record to the session
    db.add(new_cmp_details)
    db.commit()
    db.refresh(new_cmp_details)
    return new_cmp_details.id


def add_completeness_check_result(db, application_type: str, status: str, required_documents: list, doc_id: int, user_id:int):
    """
    Add a completeness check result with dynamic data.

    Args:
        db: The database session.
        application_type (str): The application type.
        status (str): The overall status of the completeness check.
        required_documents (list): A list of dictionaries where each dictionary represents a required document 
                                   with keys 'name', 'status', and 'action_needed'.

    Example of `required_documents`:
        [
            {"name": "Application Form", "status": "Not mentioned", "action_needed": "Ensure it is submitted."},
            {"name": "Building/Business Description Form", "status": "Not mentioned", "action_needed": "Ensure it is submitted."},
            {"name": "Excerpt from the Cadastral Map", "status": "Mentioned as provided", "action_needed": "✔ Present"}
        ]
    """
    try:
        # Create a CompletenessCheckResult instance
        completeness_check = models.CompletenessCheckResult(
            application_type=application_type,
            status=status,
            user_id=user_id,
            document_id=doc_id
        )
        
        # Add required documents dynamically
        for doc in required_documents:
            required_document = models.RequiredDocument(
                name=doc["name"],
                status=doc["status"],
                action_needed=doc["action_needed"]
            )
            completeness_check.required_documents.append(required_document)
        
        db.add(completeness_check)
        db.commit()
        return {"message": "Completeness check result added successfully."}
    
    except Exception as e:
        db.rollback()
        raise Exception(f"Failed to add completeness check result: {str(e)}")