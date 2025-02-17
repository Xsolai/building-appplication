from ..models import models
from fastapi.responses import JSONResponse
import json
from geopy.geocoders import Nominatim

mapping = {
    "location_within_building_zone": "location_within_building_zone",
    "building_use_type": "building_use_type",
    "building_style": "building_style",
    "grz": "grz",
    "gfz": "gfz",
    "building_height": "building_height",
    "number_of_floors": "number_of_floors",
    "roof_shape": "roof_shape",
    "dormers": "dormers",
    "roof_orientation": "roof_orientation",
    "parking_spaces": "parking_spaces",
    "outdoor_space": "outdoor_space",
    "setback_area": "setback_area",
    "setback_relevant_filling_work": "setback_relevant_filling_work",
    "deviations_from_b_plan": "deviations_from_b_plan",
    "exemptions_required": "exemptions_required",
    "species_protection_check": "species_protection_check",
    "compliance_with_zoning_rules": "compliance_with_zoning_rules",
    "compliance_with_building_codes": "compliance_with_building_codes",
}

def extract_project_details_as_string(db, doc_id):
    # Extract project details from the database
    proj_details = {}
    project_details = db.query(models.ProjectDetails).filter(models.ProjectDetails.document_id == doc_id).first()

    if not project_details:
        return JSONResponse(content={"error": "No project details found for the project"}, status_code=404)

    for key, value in mapping.items():
        proj_details[key] = getattr(project_details, value, None)

    # Convert the dictionary to a JSON-like string
    proj_details_str = json.dumps(proj_details, indent=4)
    return project_details.id, proj_details_str

def extract_bplan_details_as_string(db, doc_id, bplan_id):
    # Extract project details from the database
    bplan = {}
        # Use the .has() method to filter based on the relationship
    bplan_details = db.query(models.BPlanDetails).filter(
        models.BPlanDetails.document_id == doc_id,
        models.BPlanDetails.bplan.has(id=bplan_id)
    ).first()
    
    if not bplan_details:
        return JSONResponse(content={"error": "No project details found for the project"}, status_code=404)

    for key, value in mapping.items():
        bplan[key] = getattr(bplan_details, value, None)

    # Convert the dictionary to a JSON-like string
    bplan_details_str = json.dumps(bplan, indent=4)
    return bplan_details.id, bplan_details_str

def get_coordinates(address):
    geolocator = Nominatim(user_agent="geo_coordinates_app")
    
    # Geocode the address to get coordinates
    location = geolocator.geocode(address) 
    
    if location:
        print(f"location: {location} found and coordinates are {location.latitude}, {location.longitude}")
        return location.latitude, location.longitude
    else:
        return None, None