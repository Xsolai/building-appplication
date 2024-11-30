from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Boolean, DateTime, Float
from ..database.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy import create_engine
from datetime import datetime


# User model with username, email, contact number, and passwords
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    contact_number = Column(String, nullable=False)
    title = Column(String, default=None)
    organization = Column(String, default=None)
    work_phone = Column(String, default=None)
    password = Column(String, nullable=False)

    # One user can upload many documents
    documents = relationship('Document', back_populates='user')
    feedbacks = relationship("Feedback", back_populates="user")

# Document model
class Document(Base):
    __tablename__ = 'documents'

    id = Column(Integer, primary_key=True)
    file_name = Column(String)
    uploaded_at = Column(String)
    user_id = Column(Integer, ForeignKey('users.id'))

    # One document can have many analysis results
    analysis_results = relationship('AnalysisResult', back_populates='document')

    # Relationship to the user who uploaded the document
    user = relationship('User', back_populates='documents')

# AnalysisResult model with JSON field for key-value pairs
class AnalysisResult(Base):
    __tablename__ = 'analysis_results'

    id = Column(Integer, primary_key=True)
    result_data = Column(JSON)  # Store the analysis result as a JSON key-value pair
    duration = Column(Float)
    document_id = Column(Integer, ForeignKey('documents.id'))

    # Relationship to the document it belongs to
    document = relationship('Document', back_populates='analysis_results')

# Define the ComplianceStatus model (no change)
class ComplianceStatus(Base):
    __tablename__ = 'compliance_status'

    id = Column(Integer, primary_key=True)
    status = Column(String)
    details = Column(String)
    document_id = Column(Integer, ForeignKey('documents.id'))

    # Relationship to the document for which compliance is checked
    document = relationship('Document')



class Voucher(Base):
    __tablename__ = "vouchers"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)



# feedback model
class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    feedback_text = Column(String, nullable=False)
    voucher_code = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="feedbacks")
