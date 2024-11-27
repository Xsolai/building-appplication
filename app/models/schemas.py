from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class User(BaseModel):
    name: str
    email: str
    contact_number:str
    password1: str
    password2: str
    
    class Config():
        orm_mode = True
        
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
    contact_number:str
    
    class Config():
        orm_mode = True

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