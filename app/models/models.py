from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Boolean, DateTime, Float, Text
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
    project_details = relationship("ProjectDetails", back_populates="user")
    bplan_details = relationship("BPlanDetails", back_populates="user")
    bplan = relationship("BPlan", back_populates="user")
    cmp_details = relationship("ComplianceDetails", back_populates="user")

# Document model
class Document(Base):
    __tablename__ = 'documents'

    id = Column(Integer, primary_key=True)
    file_name = Column(String)
    uploaded_at = Column(String)
    # uploaded_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey('users.id'))

    # Relationships
    user = relationship('User', back_populates='documents')
    analysis_results = relationship('AnalysisResult', back_populates='document')
    # document = relationship('Document', back_populates='compliance_status')
    bplan = relationship("BPlan", back_populates="document")
    project_details = relationship("ProjectDetails", back_populates="document")
    bplan_details = relationship("BPlanDetails", back_populates="document")
    cmp_details = relationship("ComplianceDetails", back_populates="document")

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
    document_id = Column(Integer, ForeignKey('documents.id'), nullable=True)  # Add the foreign key

    user = relationship("User", back_populates="feedbacks")
    document = relationship("Document")
    
    
# BPlan model
class BPlan(Base):
    __tablename__ = 'bplans'

    id = Column(Integer, primary_key=True)
    file_name = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey('users.id'))
    document_id = Column(Integer, ForeignKey('documents.id'))  # Add this foreign key

    # Relationships
    user = relationship('User', back_populates='bplan')
    document = relationship('Document', back_populates='bplan')  # Link to Document
    bplan_details = relationship("BPlanDetails", back_populates="bplan")
    cmp_details = relationship("ComplianceDetails", back_populates="bplan")

    
    
class ProjectDetails(Base):
    __tablename__ = "project_details"

    id = Column(Integer, primary_key=True, index=True)
    location_within_building_zone = Column(String(255), nullable=True)
    building_use_type = Column(String(255), nullable=True)
    building_style = Column(String(255), nullable=True)
    grz = Column(String(255), nullable=True)  # Ground Area Ratio
    gfz = Column(String(255), nullable=True)  # Floor Space Ratio
    building_height = Column(String(255), nullable=True)  # Height in meters
    number_of_floors = Column(String(255), nullable=True)
    roof_shape = Column(String(255), nullable=True)
    dormers = Column(String(255), nullable=True)
    roof_orientation = Column(String(255), nullable=True)
    parking_spaces = Column(String(255), nullable=True)
    outdoor_space = Column(String(255), nullable=True)
    setback_area = Column(String(255), nullable=True)  # Area in square meters
    setback_relevant_filling_work = Column(Text, nullable=True)
    deviations_from_b_plan = Column(Text, nullable=True)
    exemptions_required = Column(Text, nullable=True)
    species_protection_check = Column(String(255), nullable=True)
    compliance_with_zoning_rules = Column(String(255), nullable=True) 
    compliance_with_building_codes = Column(Text, nullable=True)
    longitude = Column(Float)
    latitude = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    document_id = Column(Integer, ForeignKey('documents.id'), nullable=False)

    # Relationships
    user = relationship('User', back_populates='project_details')
    document = relationship('Document', back_populates='project_details')
    cmp_details = relationship("ComplianceDetails", back_populates="project_details")
    
class BPlanDetails(Base):
    __tablename__ = "bplan_details"

    id = Column(Integer, primary_key=True, index=True)
    location_within_building_zone = Column(String(255), nullable=True)
    building_use_type = Column(String(255), nullable=True)
    building_style = Column(String(255), nullable=True)
    grz = Column(String(255), nullable=True)  # Ground Area Ratio
    gfz = Column(String(255), nullable=True)  # Floor Space Ratio
    building_height = Column(String(255), nullable=True)  # Height in meters
    number_of_floors = Column(String(255), nullable=True)
    roof_shape = Column(String(255), nullable=True)
    dormers = Column(String(255), nullable=True)
    roof_orientation = Column(String(255), nullable=True)
    parking_spaces = Column(String(255), nullable=True)
    outdoor_space = Column(String(255), nullable=True)
    setback_area = Column(String(255), nullable=True)  # Area in square meters
    setback_relevant_filling_work = Column(Text, nullable=True)
    deviations_from_b_plan = Column(Text, nullable=True)
    exemptions_required = Column(Text, nullable=True)
    species_protection_check = Column(String(255), nullable=True)
    compliance_with_zoning_rules = Column(String(255), nullable=True)
    compliance_with_building_codes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    duration = Column(Float)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    document_id = Column(Integer, ForeignKey('documents.id'), nullable=False)
    bplan_id = Column(Integer, ForeignKey('bplans.id'), nullable=False)

    # Relationships
    user = relationship('User', back_populates='bplan_details')
    document = relationship('Document', back_populates='bplan_details')
    bplan = relationship('BPlan', back_populates='bplan_details')
    cmp_details = relationship("ComplianceDetails", back_populates="bplan_details")
    
    
class ComplianceDetails(Base):
    __tablename__ = "compliance_details"

    id = Column(Integer, primary_key=True, index=True)
    compliant_status = Column(String, nullable=False)
    location_within_building_zone = Column(JSON, nullable=True)
    building_use_type = Column(JSON, nullable=True)
    building_style = Column(JSON, nullable=True)
    grz = Column(JSON, nullable=True)
    gfz = Column(JSON, nullable=True)
    building_height = Column(JSON, nullable=True)
    number_of_floors = Column(JSON, nullable=True)
    roof_shape = Column(JSON, nullable=True)
    dormers = Column(JSON, nullable=True)
    roof_orientation = Column(JSON, nullable=True)
    parking_spaces = Column(JSON, nullable=True)
    outdoor_space = Column(JSON, nullable=True)
    setback_area = Column(JSON, nullable=True)
    setback_relevant_filling_work = Column(JSON, nullable=True)
    deviations_from_b_plan = Column(JSON, nullable=True)
    exemptions_required = Column(JSON, nullable=True)
    species_protection_check = Column(JSON, nullable=True)
    compliance_with_zoning_rules = Column(JSON, nullable=True)
    compliance_with_building_codes = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # duration = Column(Float)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    document_id = Column(Integer, ForeignKey('documents.id'), nullable=False)
    bplan_id = Column(Integer, ForeignKey('bplans.id'), nullable=False)
    project_details_id = Column(Integer, ForeignKey('project_details.id'), nullable=False)
    bplan_details_id = Column(Integer, ForeignKey('bplan_details.id'), nullable=False)

    # Relationships
    user = relationship('User', back_populates='cmp_details')
    document = relationship('Document', back_populates='cmp_details')
    bplan = relationship('BPlan', back_populates='cmp_details')
    project_details = relationship("ProjectDetails", back_populates="cmp_details")
    bplan_details = relationship("BPlanDetails", back_populates="cmp_details")