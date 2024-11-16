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
    
    class Config():
        orm_mode = True
        
class Results(BaseModel):
    result_data: Dict[str, Any]
    
    class Config():
        orm_mode = True
        
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