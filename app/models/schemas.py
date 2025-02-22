from pydantic import BaseModel, EmailStr, validator, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


# class User(BaseModel):
#     name: str
#     email: str
#     contact_number:str
#     password1: str
#     password2: str
    
#     class Config():
#         orm_mode = True
class User(BaseModel):
    name: str
    email: EmailStr
    contact_number: str
    password1: str
    password2: str

    class Config:
        orm_mode = True

    # Validator to check if passwords match
    @validator("password2")
    def passwords_match(cls, password2, values):
        if "password1" in values and password2 != values["password1"]:
            raise ValueError("Passwords do not match.")
        return password2
        
class UpdateUser(BaseModel):
    username: str
    title: str
    organization: str
    work_phone: str
    contact_number:str
    email:str
    
    class Config():
        orm_mode = True
        
        
class ShowUser(BaseModel):
    username: str
    email: str
    title: str | None = None
    organization: str | None = None
    work_phone: str | None = None
    contact_number: str | None = None
    
    class Config:
        orm_mode = True

class UpdateUser(BaseModel):
    username: str | None = None
    email: str | None = None
    title: str | None = None
    organization: str | None = None
    work_phone: str | None = None
    contact_number: str | None = None

    
class Projects(BaseModel):
    file_name: str
    status: Optional[str] = None  # Add the optional status field

    class Config:
        orm_mode = True
        
# class Results(BaseModel):
#     result_data: Dict[str, Any]
    
#     class Config():
#         orm_mode = True
        
class Login(BaseModel):
    email : str
    password : str
    
    class Config():
        orm_mode = True
        
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str


class VoucherCreate(BaseModel):
    code: str

class VoucherResponse(BaseModel):
    id: int
    code: str
    is_used: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True



class FeedbackCreate(BaseModel):
    feedback_text: str

class FeedbackResponse(BaseModel):
    message: str
    voucher_code: str



class ForgetPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str


class AnalysisResult(BaseModel):
    # Define fields based on your database model
    result: str

class ComplianceStatus(BaseModel):
    status: str
    details: str

# class Results(BaseModel):
#     compliance_status: str
#     analysis_result: Dict[str, Any]
#     non_compliant_details: str
class Results(BaseModel):
    compliance_status: Optional[str] = None  # Optional with default value None
    analysis_result: Dict[str, Any]
    non_compliant_details: Optional[str] = None  # Optional with default value None
    completed: Optional[str] = None
    pending: Optional[float] = None
    
class ResultData(BaseModel):
    Project_title: str = Field(..., alias="Project title")
    Project_location: str = Field(..., alias=" Project location")
    Client_Applicant: str = Field(..., alias=" Client/Applicant")
    Project_type: str = Field(..., alias=" Project type")
    Building_class: str = Field(..., alias=" Building class")
    Building_usage: str = Field(..., alias=" Building usage")
    Number_of_floors: str = Field(..., alias=" Number of floors")
    Gross_floor_area: str = Field(..., alias=" Gross floor area")
    Volume_of_the_building: str = Field(..., alias=" Volume of the building")
    Technical_Data: str = Field(..., alias=" Technical Data")
    Relevant_authorities: str = Field(..., alias=" Relevant authorities")

class UpdateAnalysisResult(BaseModel):
    result_data: ResultData
    duration: Optional[float] = None