import os
import zipfile
from ..models import models
from datetime import datetime


def unzip_files(extracted_from, extracted_to):
    os.makedirs(extracted_to, exist_ok=True)
    try:
        with zipfile.ZipFile(extracted_from, 'r') as file:
            # zip_ref.extractall(extracted_to)
            print("namelist", file.namelist())
            for member in file.namelist():
                member = member.strip()
                # print(member)
                # Extract each file individually, ensuring proper encoding
                file.extract(member, path=extracted_to)
                
                # This step ensures filenames retain special characters
                extracted_path = os.path.join(extracted_to, member)
                
                # Rename the extracted file to match the original filename
                original_path = os.path.join(extracted_to, member)
                if original_path != extracted_path:
                    os.rename(original_path, extracted_path)
        print(f"Files successfully extracted to {extracted_to}")
    except zipfile.BadZipFile:
        print(f"Error: {extracted_from} is not a valid zip file.")
    except Exception as e:
        print(f"An error occurred: {e}")


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

def save_analysis_into_db(db, response, doc_id:int = None):
    new_analysis = models.AnalysisResult(
            result_data = response,
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