from fastapi import HTTPException, status
import openai
from dotenv import load_dotenv
import os, time
import logging
import requests
from concurrent.futures import ThreadPoolExecutor
from .image_service import encode_images_to_base64, parse_response_data, parse_cmp_data
from .file_service import save_bplan_details_into_db

# Load environment variables from .env file
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# System prompts to guide the model
# B_PLAN_SYSTEM_PROMPT = f"Extract all the text that is present in the image. Just focus on the detailed guidelines and provide me in a detailed summary.Also translate into english "
B_PLAN_SYSTEM_PROMPT = """
You are a construction compliance assistant specializing in analyzing and extracting relevant information from images related to construction projects and zoning plans. Your goal is to identify details necessary for evaluating compliance with zoning and construction standards. You will extract these details systematically and clearly so that they can be used in a comparison process using a separate method defined by the user.

#### Process for Extraction:

1. **Image Analysis:**
   - Identify and extract key zoning plan details from the provided image:
     - **Location** of the construction project and auxiliary facilities:
       - Is the construction site within designated areas? Are auxiliary structures located appropriately?
     - **Type of construction use**:
       - Is it permissible generally or by exception?
   - Evaluate construction parameters:
     - Ground Area Ratio (**GRZ**)
     - Floor Area Ratio (**GFZ**)
     - Building height and number of stories
     - Roof characteristics (shape, dormers, ridge direction)
   - Check for inclusion of:
     - Parking space documentation
     - Open space plan details

2. **Environmental and Structural Regulations:**
   - Spacing areas:
     - Extract dimensions related to spacing compliance under state building codes (**HBO**).
   - Exemptions and deviations:
     - Identify potential needs for exceptions from the zoning plan or state regulations.
   - Environmental impact:
     - Look for evidence of species protection concerns or other ecological risks.

3. **Preparation for Comparison:**
   - Ensure all extracted details are formatted consistently and clearly for use in the user-defined comparison method.
   - Highlight any uncertainties or areas requiring further clarification from additional images or documents.

#### Guidelines:
- Use precise terminology, ensuring technical details are easy to interpret.
- Clarify ambiguous details or suggest additional data sources (e.g., more images or schematics) if necessary.
- Do not perform the comparison directly; focus only on extracting and organizing the required information.
"""


CMP_SYSTEM_PROMPT = """
1. **Task:**  
- Extract key building details from the provided **images**, with proper measurements and scales, and present them as bullet points.  
- If no relevant details can be found, mention the missing detail and provide the reason for the absence.  

2. **Input:**  
- You will receive a set of **images** related to a building or development project. 

3. **Objective:**  
- Extract relevant **building information** from the images and **format it into points**.    
- **Highlight missing details** and state **reasons** for any missing or non-compliant information.


### **Output Requirements:**  

1. **Building Details Extracted (from Images):**  
   - Present extracted details as **bullet points**, categorized based on the guideline sections.

2. **Missing:**  
   - List any guideline sections that are **missing** in the images.

"""
SYSTEM_PROMPT = """
You're an experienced AI-powered arhictecture reviewer. Must provide all details in german language.
You're familiar with the German building codes and regulations.
Must provide area and volume details if foun in the content
Display the details about by extracting info from text and analyse images to understand about the architecture in pdfs:
- Project title 
- Project location
- client/Applicant
- Project type 
- Building class (for example GK3, etc..)
- building usage (for which they're constructing a building)
- number of floors
- Gross area of the building
- volume of the building
- Technical Data (like Fire resistance classes (EI 90-M, EI 60-M, F90, F60, etc), following strandard heating system or not, etc..)
- Relevant authorities
"""

# OpenAI API key
def get_api_key(OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")):
    if not OPENAI_API_KEY:
        logger.error("OpenAI API key is missing. Ensure it's set in the environment variables.")
        raise RuntimeError("OpenAI API key is not set")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    return OPENAI_API_KEY

openai.api_key = get_api_key()

# OpenAI API Request
def call_openai_api(payload: dict) -> dict:
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {get_api_key()}",
        }
        response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

        if response.status_code != 200:
            logger.error(f"OpenAI API Error: {response.text}")
            raise HTTPException(status_code=response.status_code, detail=f"OpenAI API Error: {response.text}")

        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error when connecting to OpenAI: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Unable to connect to OpenAI.")


def send_to_gpt(encoded_images: list, prompt):
    responses = []

    def process_image(encoded_image, index):
        print(f"Processing image {index + 1}")
        payload = {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": prompt
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{encoded_image}"
                            }
                        }
                    ]
                }
            ]
        }
        response_json = call_openai_api(payload=payload)
        assistant_message = response_json['choices'][0]['message']['content']
        # print("Assistant msg:", assistant_message)
        responses.append(assistant_message)

    # Using ThreadPoolExecutor to manage threads
    with ThreadPoolExecutor(max_workers=10) as executor:
        for i, encoded_image in enumerate(encoded_images):
            executor.submit(process_image, encoded_image, i)

    logger.info("Successfully processed images and generated responses.")
    return responses


# def extract_project_title(encoded_images: list):
#     prompt = """
#     Extract the title of the project from the provided images. The project title should be the primary name or designation of the construction or development project.
#     """
#     return send_to_gpt(encoded_images, prompt)

# def extract_project_location(encoded_images: list):
#     prompt = """
#     Extract the location of the construction project from the images. Look for city, address, or any zoning-related location references.
#     """
#     return send_to_gpt(encoded_images, prompt)

# def extract_client_applicant(encoded_images: list):
#     prompt = """
#     Extract the client or applicant's name from the images. This should include the individual or organization responsible for the project.
#     """
#     return send_to_gpt(encoded_images, prompt)

# def extract_project_type(encoded_images: list):
#     prompt = """
#     Extract the type of the project from the images. Look for terms like 'residential', 'commercial', 'industrial', etc.
#     """
#     return send_to_gpt(encoded_images, prompt)

# def extract_building_class(encoded_images: list):
#     prompt = """
#     Extract the building class (e.g., GK3, etc.) from the images. This should refer to the classification of the building based on its size and function.
#     """
#     return send_to_gpt(encoded_images, prompt)

# def extract_building_usage(encoded_images: list):
#     prompt = """
#     Extract the building usage from the images. This should describe the intended purpose of the building, such as 'office', 'residential', 'mixed-use', etc.
#     """
#     return send_to_gpt(encoded_images, prompt)

# def extract_number_of_floors(encoded_images: list):
#     prompt = """
#     Extract the number of floors of the building from the images. Look for references to floor plans or building specifications.
#     """
#     return send_to_gpt(encoded_images, prompt)

# def extract_gross_area(encoded_images: list):
#     prompt = """
#     Extract the gross area (total area) of the building from the images. Look for the total square footage or area measurements mentioned in the project.
#     """
#     return send_to_gpt(encoded_images, prompt)

# def extract_volume(encoded_images: list):
#     prompt = """
#     Extract the volume of the building from the images. This can be calculated from the given dimensions or provided directly in the content.
#     """
#     return send_to_gpt(encoded_images, prompt)

# def extract_technical_data(encoded_images: list):
#     prompt = """
#     Extract the technical data related to the building's fire resistance classes (e.g., EI 90-M, F90) and heating system from the images.
#     """
#     return send_to_gpt(encoded_images, prompt)

# def extract_relevant_authorities(encoded_images: list):
#     prompt = """
#     Extract information about the relevant authorities for the project from the images. This may include city councils, building inspectors, or other governmental bodies involved in approving the project.
#     """
#     return send_to_gpt(encoded_images, prompt)


# Separate prompt for each new field
def extract_location_within_building_zone(encoded_images: list):
    prompt = """
    Just Extract the location of the project within the designated building zone from the images. Provide details of any specific zoning requirements or compliance factors.
    """
    return send_to_gpt(encoded_images, prompt)

def extract_building_use_type(encoded_images: list):
    prompt = """
    Extract the building use type from the images. Specify whether the building is residential, commercial, industrial, or mixed-use.
    """
    return send_to_gpt(encoded_images, prompt)

def extract_building_style(encoded_images: list):
    prompt = """
    Extract the building style from the images. Provide information on architectural design or stylistic features.
    """
    return send_to_gpt(encoded_images, prompt)

def extract_grz_compliance(encoded_images: list):
    prompt = """
    Extract information on GRZ (Ground Area Ratio) compliance from the images. Indicate whether the project adheres to zoning regulations.
    """
    return send_to_gpt(encoded_images, prompt)

def extract_gfz_compliance(encoded_images: list):
    prompt = """
    Extract information on GFZ (Floor Area Ratio) compliance from the images. Indicate whether the project meets zoning requirements.
    """
    return send_to_gpt(encoded_images, prompt)

def extract_building_height_compliance(encoded_images: list):
    prompt = """
    Extract the compliance status for the building height. Check if the height adheres to zoning and regulatory limits.
    """
    return send_to_gpt(encoded_images, prompt)

def extract_number_of_floors_compliance(encoded_images: list):
    prompt = """
    Extract information about the compliance of the number of floors with zoning regulations. Specify any discrepancies.
    """
    return send_to_gpt(encoded_images, prompt)

def extract_roof_shape_compliance(encoded_images: list):
    prompt = """
    Extract compliance details for the roof shape. Provide information on whether the roof meets zoning and design standards.
    """
    return send_to_gpt(encoded_images, prompt)

def extract_dormers_compliance(encoded_images: list):
    prompt = """
    Extract details about compliance related to dormers. Indicate if they meet the relevant zoning and design criteria.
    """
    return send_to_gpt(encoded_images, prompt)

def extract_roof_orientation_compliance(encoded_images: list):
    prompt = """
    Extract compliance details for roof orientation. Check if the orientation adheres to building or zoning regulations.
    """
    return send_to_gpt(encoded_images, prompt)

def extract_parking_spaces_compliance(encoded_images: list):
    prompt = """
    Extract compliance information for parking spaces. Indicate whether the number and type of parking spaces meet regulations.
    """
    return send_to_gpt(encoded_images, prompt)

def extract_outdoor_space_compliance(encoded_images: list):
    prompt = """
    Extract compliance information for outdoor spaces. Include details on landscaping or open space requirements.
    """
    return send_to_gpt(encoded_images, prompt)

def extract_setback_area_compliance(encoded_images: list):
    prompt = """
    Extract compliance information for setback areas. Indicate whether the project adheres to setback regulations.
    """
    return send_to_gpt(encoded_images, prompt)

def extract_setback_relevant_filling_work(encoded_images: list):
    prompt = """
    Extract details of any filling work relevant to setback areas. Indicate if it complies with regulations.
    """
    return send_to_gpt(encoded_images, prompt)

def extract_deviations_from_b_plan(encoded_images: list):
    prompt = """
    Extract details of any deviations from the B-Plan (Building Plan). Highlight any areas of non-compliance.
    """
    return send_to_gpt(encoded_images, prompt)

def extract_exemptions_required(encoded_images: list):
    prompt = """
    Extract details about any exemptions required for the project. Indicate specific regulations or codes needing exemptions.
    """
    return send_to_gpt(encoded_images, prompt)

def extract_species_protection_check(encoded_images: list):
    prompt = """
    Extract information on species protection checks conducted for the project. Indicate any ecological considerations.
    """
    return send_to_gpt(encoded_images, prompt)

def extract_compliance_with_zoning_rules(encoded_images: list):
    prompt = """
    Extract information on compliance with zoning rules. Specify whether the project adheres to all zoning regulations.
    """
    return send_to_gpt(encoded_images, prompt)

def extract_compliance_with_building_codes(encoded_images: list):
    prompt = """
    Extract information on compliance with building codes. Highlight any specific codes or standards met or violated.
    """
    return send_to_gpt(encoded_images, prompt)


def final_response(responses:list):
    prompt = """You will recieve a list of responses. You task is to select the most appropriate detail from it. Choose only an accurate single value based on details instead of multiple. The format you should follow:
- Project title 
- Project location
- client/Applicant
- Project type 
- Building class (for example GK3, etc..)
- building usage (for which they're constructing a building)
- number of floors
- Gross floor area (total area)
- volume of the building
- Technical Data (like Fire resistance classes (EI 90-M, EI 60-M, F90, F60, etc), following strandard heating system or not, etc..) must be in one line
- Relevant authorities
    """
    responses = " ".join([response for response in responses])
    payload = {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": prompt
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": responses
                        }
                    ]
                }
            ],
            "max_tokens": 4095
        }
    # Send the request to the OpenAI API
    response_json = call_openai_api(payload=payload)

    # Extract the assistant's message from the response
    assistant_message = response_json['choices'][0]['message']['content']
    response = parse_response_data(assistant_message.replace("**",""))
    return response

def final_fields(responses:list, field:str):
    prompt = f"You will recieve a list of responses realted to {field}. Your task is to select the most appropriate and accurate detail from it. Choose only an accurate single value based on details instead of multiple. I don't need extra details just provide the important details without providing extra explanation."
    responses = " ".join([response for response in responses])
    payload = {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": prompt
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": responses
                        }
                    ]
                }
            ],
            "max_tokens": 4095
        }
    # Send the request to the OpenAI API
    response_json = call_openai_api(payload=payload)

    # Extract the assistant's message from the response
    assistant_message = response_json['choices'][0]['message']['content']
    # response = parse_response_data(assistant_message.replace("**",""))
    return assistant_message


# Final method 
def extracting_project_details(images_path=None):
    try:
        # Ensure the image directory exists
        if not os.path.exists(images_path):
            raise HTTPException(status_code=404, detail="No images found for analysis.")
       
        # Convert each image to base64
        encoded_images = encode_images_to_base64(images_path=images_path)
        logger.info(f"Encoded {len(encoded_images)} images.")
        
        print("Extracting info for fields")
        # Define variables using the specified structure
        location_within_building_zone = final_fields(responses=extract_location_within_building_zone(encoded_images), field="location_within_building_zone")
        building_use_type = final_fields(responses=extract_building_use_type(encoded_images), field="building_use_type")
        building_style = final_fields(responses=extract_building_style(encoded_images), field="building_style")
        grz = final_fields(responses=extract_grz_compliance(encoded_images), field="grz of the building")
        gfz = final_fields(responses=extract_gfz_compliance(encoded_images), field="gfz of the building")
        building_height = final_fields(responses=extract_building_height_compliance(encoded_images), field="building_height")
        number_of_floors = final_fields(responses=extract_number_of_floors_compliance(encoded_images), field="number_of_floors")
        roof_shape = final_fields(responses=extract_roof_shape_compliance(encoded_images), field="roof_shape")
        dormers = final_fields(responses=extract_dormers_compliance(encoded_images), field="dormers")
        roof_orientation = final_fields(responses=extract_roof_orientation_compliance(encoded_images), field="roof_orientation")
        parking_spaces = final_fields(responses=extract_parking_spaces_compliance(encoded_images), field="parking_spaces")
        outdoor_space = final_fields(responses=extract_outdoor_space_compliance(encoded_images), field="outdoor_space")
        setback_area = final_fields(responses=extract_setback_area_compliance(encoded_images), field="setback_area")
        setback_relevant_filling_work = final_fields(responses=extract_setback_relevant_filling_work(encoded_images), field="setback_relevant_filling_work")
        deviations_from_b_plan = final_fields(responses=extract_deviations_from_b_plan(encoded_images), field="deviations_from_b_plan")
        exemptions_required = final_fields(responses=extract_exemptions_required(encoded_images), field="exemptions_required")
        species_protection_check = final_fields(responses=extract_species_protection_check(encoded_images), field="species_protection_check")
        compliance_with_zoning_rules = final_fields(responses=extract_compliance_with_zoning_rules(encoded_images), field="compliance_with_zoning_rules")
        compliance_with_building_codes = final_fields(responses=extract_compliance_with_building_codes(encoded_images), field="compliance_with_building_codes")
        
        # Combine into a dictionary if needed
        result = {
            "location_within_building_zone": location_within_building_zone,
            "building_use_type": building_use_type,
            "building_style": building_style,
            "grz": grz,
            "gfz": gfz,
            "building_height": building_height,
            "number_of_floors": number_of_floors,
            "roof_shape": roof_shape,
            "dormers": dormers,
            "roof_orientation": roof_orientation,
            "parking_spaces": parking_spaces,
            "outdoor_space": outdoor_space,
            "setback_area": setback_area,
            "setback_relevant_filling_work": setback_relevant_filling_work,
            "deviations_from_b_plan": deviations_from_b_plan,
            "exemptions_required": exemptions_required,
            "species_protection_check": species_protection_check,
            "compliance_with_zoning_rules": compliance_with_zoning_rules,
            "compliance_with_building_codes": compliance_with_building_codes,
        }
        print("\n\nNow extracting Analysis info")
        # Extract analysis info
        analysis_info = send_to_gpt(encoded_images, prompt=SYSTEM_PROMPT)
        response = final_response(responses=analysis_info)
        
        # results.append(str(result))
        # print(results)
        # response = final_response(responses=results)
        # print("Final response is:\n", response)
        return {
            "extracted_fields": result,
            "analysis": response
        }
    
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing the image.")
       

def extracting_bplan_details(db, user_id, doc_id, b_plan_path: str = None):
    """
    method to analyze images that were converted from PDFs.
    """
    try:
        start_time = time.time()
        logging.info(start_time)
        images_path = b_plan_path

        # Ensure the image directory exists
        if not os.path.exists(images_path):
            raise HTTPException(status_code=404, detail="No images found for analysis.")

        encoded_images = []
        # responses = []
        
        encoded_images = encode_images_to_base64(images_path=images_path)
        logger.info(f"Encoded {len(encoded_images)} images.")
        
        print("Extracting info for fields")
        # Define variables using the specified structure
        location_within_building_zone = final_fields(responses=extract_location_within_building_zone(encoded_images), field="location_within_building_zone")
        building_use_type = final_fields(responses=extract_building_use_type(encoded_images), field="building_use_type")
        building_style = final_fields(responses=extract_building_style(encoded_images), field="building_style")
        grz = final_fields(responses=extract_grz_compliance(encoded_images), field="grz of the building")
        gfz = final_fields(responses=extract_gfz_compliance(encoded_images), field="gfz of the building")
        building_height = final_fields(responses=extract_building_height_compliance(encoded_images), field="building_height")
        number_of_floors = final_fields(responses=extract_number_of_floors_compliance(encoded_images), field="number_of_floors")
        roof_shape = final_fields(responses=extract_roof_shape_compliance(encoded_images), field="roof_shape")
        dormers = final_fields(responses=extract_dormers_compliance(encoded_images), field="dormers")
        roof_orientation = final_fields(responses=extract_roof_orientation_compliance(encoded_images), field="roof_orientation")
        parking_spaces = final_fields(responses=extract_parking_spaces_compliance(encoded_images), field="parking_spaces")
        outdoor_space = final_fields(responses=extract_outdoor_space_compliance(encoded_images), field="outdoor_space")
        setback_area = final_fields(responses=extract_setback_area_compliance(encoded_images), field="setback_area")
        setback_relevant_filling_work = final_fields(responses=extract_setback_relevant_filling_work(encoded_images), field="setback_relevant_filling_work")
        deviations_from_b_plan = final_fields(responses=extract_deviations_from_b_plan(encoded_images), field="deviations_from_b_plan")
        exemptions_required = final_fields(responses=extract_exemptions_required(encoded_images), field="exemptions_required")
        species_protection_check = final_fields(responses=extract_species_protection_check(encoded_images), field="species_protection_check")
        compliance_with_zoning_rules = final_fields(responses=extract_compliance_with_zoning_rules(encoded_images), field="compliance_with_zoning_rules")
        compliance_with_building_codes = final_fields(responses=extract_compliance_with_building_codes(encoded_images), field="compliance_with_building_codes")
        
        end_time = time.time()  # Record end time
        total_time = (end_time - start_time) / 60
        print("Total Time: ", total_time)
        logging.info(f"Total processing time: {total_time:.2f} minutes")
        
        # Combine into a dictionary
        result = {
            "location_within_building_zone": location_within_building_zone,
            "building_use_type": building_use_type,
            "building_style": building_style,
            "grz": grz,
            "gfz": gfz,
            "building_height": building_height,
            "number_of_floors": number_of_floors,
            "roof_shape": roof_shape,
            "dormers": dormers,
            "roof_orientation": roof_orientation,
            "parking_spaces": parking_spaces,
            "outdoor_space": outdoor_space,
            "setback_area": setback_area,
            "setback_relevant_filling_work": setback_relevant_filling_work,
            "deviations_from_b_plan": deviations_from_b_plan,
            "exemptions_required": exemptions_required,
            "species_protection_check": species_protection_check,
            "compliance_with_zoning_rules": compliance_with_zoning_rules,
            "compliance_with_building_codes": compliance_with_building_codes,
        }
        
        return {
            "result": result,
            "total_time": total_time
        }
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing the image.")

def comparison(project_details, bplan_details):
#     prompt = """  
# You will receive two inputs:  
# 1. **Extracted details of the BPlan:** An dict which consists of details like:   
# 2. **Extracted details of the Project:** Specific information about the building, such as structural elements, design specifications, materials used, safety measures, or other relevant data.  

# **Objective:**  
# Your task is to:  
# 1. **Compare** the building details against the bplan details.  

# **Output Requirements:**  
# 1. **Compliance Status of the building:** Indicate whether the building is compliant or non_compliant.
# 2. **Specific issues:** (e.g., "Building height exceeds the allowed height in the zoning plan").
# 2. **Recommended actions:** (e.g., "Adjust the height to meet regulations")..
# 3. **Additional checks if needed:** (e.g., "Perform a species protection assessment").  
# 4. Provide all the data in bullet points only and use only ### for heading
# """
    prompt = """
You will receive two inputs:
1. **Extracted BPlan Details**: A dictionary containing zoning and regulatory details such as allowed building height, ground area ratio (GRZ), floor space ratio (GFZ), setbacks, roof orientation, etc.
2. **Extracted Project Details**: A dictionary containing specific building information such as building height, usage, structural elements, materials used, safety measures, and other relevant data.

**Objective:**
Your task is to:
1. **Compare** the extracted project details against the extracted BPlan details.
2. **Identify compliance** by checking whether the project adheres to the BPlan's regulations and guidelines.

**Output Requirements:**
**IMPORTANT NOTE: Don't skip any field, try to provide the details of all the fields**
- Provide the output strictly in **JSON format** as a structured dictionary.
- Use **key-value pairs** to ensure clarity.
- Follow the structure and headings provided below exactly.

**Output Structure:**
{
  "overall_status": "compliant",
  "field_name": {
    "compliance_status": "compliant" or "non_compliant",
    "issues": [
      "Specific issue 1 (e.g., 'Building height exceeds the allowed height in the zoning plan')",
      "Specific issue 2"
    ],
    "recommended_actions": [
      "Recommended action 1 (e.g., 'Adjust the height to meet regulations')",
      "Recommended action 2"
    ],
    "additional_checks": [
      "Additional check 1 (e.g., 'Perform a species protection assessment')",
      "Additional check 2"
    ]
  }
}


### **Key Guidelines:**
1. **Strictly Adhere to the key-value Structure**:
   - Ensure that each field in the JSON (`compliance_status`, `issues`, `recommended_actions`, `additional_checks`) is provided, even if empty then just say no any.
2. **Use Bullet Points for Lists**:
   - Represent all issues, recommended actions, and additional checks as individual bullet points in JSON array format.
3. **Be Specific**:
   - For each issue identified, include concise, clear, and actionable recommendations.
4. **Include Additional Checks When Relevant**:
   - If certain checks cannot be confirmed from the given data, include them under `additional_checks`.

### **Example Input:**
{
  "bplan_details": {
    "allowed_building_height": "10 meters",
    "grz": "0.4",
    "gfz": "1.0",
    "roof_shape": "gable",
    "setback_area": "5 meters"
  },
  "project_details": {
    "building_height": "12 meters",
    "grz": "0.5",
    "roof_shape": "flat",
    "setback_area": "3 meters"
  }
}


### **Example Output:**

{
  "overall_status": "non_compliant",
  "building_height": {
    "compliance_status": "non_compliant",
    "issues": [
      "Building height exceeds the allowed height in the zoning plan (allowed: 10 meters, actual: 12 meters)"
    ],
    "recommended_actions": [
      "Reduce the building height to meet the 10-meter height restriction"
    ],
    "additional_checks": "no any"
  },
  "grz": {
    "compliance_status": "non_compliant",
    "issues": [
      "Ground Area Ratio exceeds the allowed limit (allowed: 0.4, actual: 0.5)"
    ],
    "recommended_actions": [
      "Reduce the ground area ratio to meet the 0.4 limit"
    ],
    "additional_checks": "no any"
  },
  "roof_shape": {
    "compliance_status": "non_compliant",
    "issues": [
      "Roof shape does not match the zoning plan (required: gable, actual: flat)"
    ],
    "recommended_actions": [
      "Modify the roof shape to comply with the gable requirement"
    ],
    "additional_checks": "no any"
  },
  "setback_area": {
    "compliance_status": "non_compliant",
    "issues": [
      "Setback area is less than required (required: 5 meters, actual: 3 meters)"
    ],
    "recommended_actions": [
      "Increase the setback area to at least 5 meters"
    ],
    "additional_checks": "no any"
  }
}


**Important Notes**:
- Always follow the key-value pair format and the example structure and make sure to not enclose the reponse in (```json ```).
- Ensure that all data is presented clearly and concisely, adhering to the provided guidelines.

"""
# - Must provide all details in German Language.
    # building_details = " ".join([response for response in building_details])
    payload = {
        "model": "gpt-4o",
        "messages": [
            {
                "role": "system",
                "content": prompt
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": bplan_details
                    },
                    {
                        "type": "text",
                        "text": project_details
                    }
                ]
            }
        ],
        "max_tokens": 4095
    }
    response_json = call_openai_api(payload=payload)

    # Extract the assistant's message from the response
    assistant_message = response_json['choices'][0]['message']['content']
    print("Final compliance status:\n\n\n",assistant_message)

    logger.info("Successfully processed.")
    return assistant_message
        
def PdfReport(results):
    prompt = """  
I will provide you the result in a json format. Your task is to convert the json response in  an structred pdf with proper headings. 
So, you should format it in that way that it should look like a pdf report! So that I can use that for future work!
**IMPORTANT NOTES**
- Don't mention **Start of Report** or **End of Report**. Also don't include these **---**
- Also explain the properties a bit more in a formal way to make it professional.
- Try not add additional details.
"""
    payload = {
        "model": "gpt-4o",
        "messages": [
            {
                "role": "system",
                "content": prompt
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": results
                    }
                ]
            }
        ],
        "max_tokens": 4095
    }
    response_json = call_openai_api(payload=payload)

    # Extract the assistant's message from the response
    assistant_message = response_json['choices'][0]['message']['content']

    logger.info("Successfully processed.")
    return assistant_message


def extract_location(location):
    prompt = """  
You will recieve a location with some other details. Your task is to extract only location with the country at the end.
**IMPORTANT NOTES**
- Remove any additional details. Just focus on the location.
- Try not add additional details.
"""
    payload = {
        "model": "gpt-4o",
        "messages": [
            {
                "role": "system",
                "content": prompt
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": location
                    }
                ]
            }
        ],
        "max_tokens": 4095
    }
    response_json = call_openai_api(payload=payload)

    # Extract the assistant's message from the response
    assistant_message = response_json['choices'][0]['message']['content']

    logger.info("Successfully processed.")
    return assistant_message


def completeness_check(images_path=None):
    prompt = """" 
### **System Prompt: Completeness Check Assistant**  

You are an AI assistant responsible for verifying the completeness of required **building permit documents** based on Saxon building regulations (**SächsBO** & **BauGB**). Your job is to:  

1. **Receive a list of responses**.  
2. **Cross-check** the provided responses against the requirements listed in the table below. 
3. **Ensure accuracy** and **strictly follow the structured output format** provided.   
4. **Identify missing or incomplete documents** and suggest corrections along with the name of the document.  
3. **Determine conditionally required documents** and clarify when they apply.  
4. **Ensure accuracy and clarity** by organizing responses in a structured format.  

---

## **Required Documents for Different Procedures**  

| **Documents / Forms** | **Building Application – Simplified**<br>(§63 SächsBO) | **Building Application – Special Structures**<br>(§64, in conjunction with §2(4) No.1–19 SächsBO) | **Exemption from Permit Requirement**<br>(§62 SächsBO) | **Preliminary Decision**<br>(§75 SächsBO) | **Advertising Installations**<br>(§10 SächsBO) | **Certificate of Completion**<br>(WEG: “Abgeschlossenheitsbescheinigung”) | **Preservation Ordinance Approval**<br>(§172 BauGB) |
|--------------------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| **1. Application Form** | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| **2. Building/Business Description Form** | ✔ | ✔ | + | + | + | + | ✔ |
| **3. Excerpt from the Cadastral Map** | ✔ | ✔ | + | + | + | + | ✔ |
| **4. Site Plan (based on Cadastral Map)** | ✔ | ✔ | + | + | + | + | ✔ |
| **5. Written Part (e.g., foundation details, etc.)** | ✔ | ✔ | + | + | + | + | ✔ |
| **6. Construction Drawings (floor plans, sections, elevations)** | ✔ | ✔ | + | + | + | + | ✔ |
| **7. Proof of Designer’s Qualification (Bauvorlageberechtigung)** | ✔ | ✔ | + | + | + | + | ✔ |
| **8. Proof of Utilities / Infrastructure (water, sewage, traffic, etc.)** | ✔ | ✔ | + | + | + | + | ✔ |
| **9. Fire Protection Certificate (Brandschutznachweis)** | ✔ | ✔ | + | + | + | + | ✔ |
| **10. Structural Stability Verification** | ✔ | ✔ | + | + | + | + | ✔ |
| **11. Certified Fire Protection & Structural Stability** | + | ✔ | – | – | – | – | + |
| **12. Structural Engineer’s Declaration**<br>(for certain Building Classes) | + | + | – | – | – | – | – |
| **13. Excerpt from Land Register / Owner’s Consent** | ✔ | ✔ | + | + | + | + | ✔ |
| **14. Excerpt from Development Plan**<br>(with property marked) | ✔ | ✔ | + | + | + | + | ✔ |
| **15. Statistical Survey Form** | ✔ | ✔ | – | – | – | – | – |
| **16. Tree Protection Declaration** | + | + | – | – | + | + | + |
| **17. Other Supporting Evidence**<br>(parking, heating, etc.) | + | + | – | – | – | – | + |

### **Legend:**  
- **✔ = Required**  
- **+ = May be required, depending on case**  
- **– = Not required**  

---
## 2) Explanation of Each Document / Form

Below is a **plain-English explanation** of what each row means—so that someone unfamiliar with construction or German building law can understand **why** these documents are relevant.

1. **Application Form**
    - A standard form that officially starts the building application process. It usually includes the applicant’s contact details, project address, and general project info.
2. **Building/Business Description Form**
    - A detailed written description of the intended construction or alteration. If a company is applying, it also describes the type of business activity (e.g., manufacturing, office, retail) and any special operational details.
3. **Excerpt from the Cadastral Map**
    - An official snippet of the property from the land register or cadastral office. It shows boundaries, parcel numbers, and sometimes existing structures. It proves exactly which plot of land is involved.
4. **Site Plan (based on Cadastral Map)**
    - A drawing (often 1:500 scale) that places the proposed building(s) on the property. It shows boundary lines, neighboring parcels, street access, and distances.
    - Essential for verifying compliance with zoning or local development plans.
5. **Written Part (foundation details, sections, etc.)**
    - An additional explanatory document that outlines important technical details (e.g., type of foundation, drainage solutions, site drainage, etc.).
    - It’s sometimes a formal “written supplement” to the site plan.
6. **Construction Drawings (floor plans, sections, elevations)**
    - Detailed drawings (often 1:100 scale) that show how the building is laid out internally (floors, rooms) and externally (facades, heights).
    - They allow authorities to check structural and code compliance (like fire escapes, room sizes, etc.).
7. **Proof of Designer’s Qualification (Bauvorlageberechtigung)**
    - Many jurisdictions require that only licensed architects or engineers submit official building plans. This document proves that the plan author is legally qualified.
8. **Proof of Utilities / Infrastructure (Water, Sewage, Roads, etc.)**
    - Shows how the project will be supplied with drinking water, how wastewater is disposed of, how electricity is provided, and how the site connects to public roads.
9. **Fire Protection Certificate (Brandschutznachweis)**
    - A specialized report outlining how the building design meets fire safety standards (escape routes, fire compartments, materials, alarm systems).
    - Usually mandatory for larger or more complex structures.
10. **Structural Stability Verification**
    - Engineering calculations or a report proving that the building can stand safely (load-bearing capacity, wind loads, etc.).
    - Vital for any new construction, major renovation, or additional floors.
11. **Certified Fire Protection & Structural Stability**
    - In certain “special” or larger buildings, these reports must be independently checked and signed off by a certified expert (instead of just the project’s own engineer).
12. **Structural Engineer’s Declaration** (for specific Building Classes)
    - In some building classes (often smaller houses or up to mid-size structures), the structural engineer’s signed declaration can be enough to confirm stability and fire safety.
13. **Excerpt from Land Register / Owner’s Consent**
    - A copy of the official title proving ownership or the owner’s permission if the applicant is not the owner.
    - Confirms the applicant has the legal right to build on the property.
14. **Excerpt from Development Plan (with property marked)**
    - Local planning authorities often have a “zoning map” or “development plan.” This excerpt shows the building plot in relation to zoning regulations (like building lines, green spaces, etc.).
15. **Statistical Survey Form**
    - In certain places, the government collects data on new or modified buildings for statistical purposes (e.g., number of dwelling units, energy source, etc.).
    - This form fulfills that requirement.
16. **Tree Protection Declaration**
    - Many cities have rules protecting existing trees on a building plot. This declaration ensures compliance with local “tree protection statutes” (e.g., replanting obligations if certain trees must be removed).
17. **Other Supporting Evidence**
    - This can include proof of parking space, children’s playgrounds (for certain residential developments), heating/exhaust systems, or water supply.
    - Essentially a catch-all for any additional special requirements that might apply in unique cases.

### How we Can Use This Table

1. **Identify Procedure Type**
    - Each application will specify whether it’s a “simplified building application,” “special structure application,” etc.
    - The table shows which documents are strictly required (✔) or possibly required (+) for that procedure.
2. **Capture Document Status**
    - For each document row, your system should store:
        - **Has it been submitted?** (Yes/No)
        - **Is it required for this procedure?** (Yes/No)
        - **Any relevant details** (e.g., scale, number of copies, date received).
3. **Explain Missing Documents**
    - If the procedure demands a document (✔) but the applicant hasn’t provided it, your system can flag it as **missing** or **incomplete**.

## **🛠️ How You Should Assist Users:**  
1. **Request the list of documents** they have provided.  
2. **Cross-check against the table** to identify missing, incomplete, or conditionally required documents.  
3. **Generate a structured response** using the **Evaluation Framework**.  
4. **Clearly specify next steps** for missing or incomplete items.  
    """
    try:
        # Ensure the image directory exists
        if not os.path.exists(images_path):
            raise HTTPException(status_code=404, detail="No images found for analysis.")
       
        # Convert each image to base64
        encoded_images = encode_images_to_base64(images_path=images_path)
        logger.info(f"Encoded {len(encoded_images)} images.")
        
        print("Checking completeness of the documnets..")
        analysis_info = send_to_gpt(encoded_images, prompt=prompt)
        print("compltenesss check info: ", analysis_info)
        result = final_response_cmply_check(analysis_info)
        return result
    
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing the image.")

def final_response_cmply_check(responses:list):
    prompt = """
You are an AI assistant responsible for verifying the **completeness of required building permit documents** according to Saxon building regulations (**SächsBO & BauGB**).  

### **Your Task:**  
1. You will recieve a list of responses. You task is to check the details that are mentioned in a below table is present in the reponses or not. 

## ** Required Documents for Different Procedures**  

| **Documents / Forms** | **Building Application – Simplified**<br>(§63 SächsBO) | **Building Application – Special Structures**<br>(§64, in conjunction with §2(4) No.1–19 SächsBO) | **Exemption from Permit Requirement**<br>(§62 SächsBO) | **Preliminary Decision**<br>(§75 SächsBO) | **Advertising Installations**<br>(§10 SächsBO) | **Certificate of Completion**<br>(WEG: “Abgeschlossenheitsbescheinigung”) | **Preservation Ordinance Approval**<br>(§172 BauGB) |
|--------------------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| **1. Application Form** | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| **2. Building/Business Description Form** | ✔ | ✔ | + | + | + | + | ✔ |
| **3. Excerpt from the Cadastral Map** | ✔ | ✔ | + | + | + | + | ✔ |
| **4. Site Plan (based on Cadastral Map)** | ✔ | ✔ | + | + | + | + | ✔ |
| **5. Written Part (e.g., foundation details, etc.)** | ✔ | ✔ | + | + | + | + | ✔ |
| **6. Construction Drawings (floor plans, sections, elevations)** | ✔ | ✔ | + | + | + | + | ✔ |
| **7. Proof of Designer’s Qualification (Bauvorlageberechtigung)** | ✔ | ✔ | + | + | + | + | ✔ |
| **8. Proof of Utilities / Infrastructure (water, sewage, traffic, etc.)** | ✔ | ✔ | + | + | + | + | ✔ |
| **9. Fire Protection Certificate (Brandschutznachweis)** | ✔ | ✔ | + | + | + | + | ✔ |
| **10. Structural Stability Verification** | ✔ | ✔ | + | + | + | + | ✔ |
| **11. Certified Fire Protection & Structural Stability** | + | ✔ | – | – | – | – | + |
| **12. Structural Engineer’s Declaration**<br>(for certain Building Classes) | + | + | – | – | – | – | – |
| **13. Excerpt from Land Register / Owner’s Consent** | ✔ | ✔ | + | + | + | + | ✔ |
| **14. Excerpt from Development Plan**<br>(with property marked) | ✔ | ✔ | + | + | + | + | ✔ |
| **15. Statistical Survey Form** | ✔ | ✔ | – | – | – | – | – |
| **16. Tree Protection Declaration** | + | + | – | – | + | + | + |
| **17. Other Supporting Evidence**<br>(parking, heating, etc.) | + | + | – | – | – | – | + |

### **Legend:**  
- **✔ = Required**  
- **+ = May be required, depending on case**  
- **– = Not required**  

---  

## **Evaluation Process:**  
- Verify whether each required document is **mentioned in the provided responses**.  
- If **all required documents** are present, mark the **status as "Complete"**.  
- If **any required document is missing**, mark the **status as "Incomplete"** and list missing documents.  
---  

## ** Output Format (Strictly Follow This Format)**  

```
{
  "application_type": "<Type of Application>",
  "status": "<Complete / Incomplete>",
  "required_documents": [
    {
      "name": "<Document Name>",
      "status": "<Mentioned as provided / Not mentioned / Not clearly mentioned>",
      "action_needed": "<✔️ Present / Ensure it is submitted / Confirm necessity and submit if required>"
    }
  ],
  "conclusion": {
    "complete": ["<List of documents that are correctly submitted>"],
    "missing": ["<List of missing documents>"]
  }
}
```

### **Example Output:**  
```
{
  "application_type": "Special Structures (§64, in conjunction with §2(4) No.1–19 SächsBO) or any other ",
  "status": "Incomplete",
  "required_documents": [
    {
      "name": "Application Form",
      "status": "Not mentioned",
      "action_needed": "Ensure it is submitted."
    },
    {
      "name": "Building/Business Description Form",
      "status": "Mentioned as provided",
      "action_needed": "✔️ Present"
    },
    {
      "name": "Excerpt from the Cadastral Map",
      "status": "Not mentioned",
      "action_needed": "Ensure it is submitted."
    },
    {
      "name": "Site Plan (based on Cadastral Map)",
      "status": "Mentioned as provided",
      "action_needed": "✔️ Present"
    },
    {
      "name": "Written Part (e.g., foundation details, etc.)",
      "status": "Not mentioned",
      "action_needed": "Ensure it is detailed and submitted."
    },
    {
      "name": "Construction Drawings (floor plans, sections, elevations)",
      "status": "Not mentioned",
      "action_needed": "Ensure they are submitted."
    }
  ],
  "conclusion": {
    "complete": [
      "Building/Business Description Form",
      "Site Plan"
    ],
    "missing": [
      "Application Form",
      "Excerpt from the Cadastral Map",
      "Written Part",
      "Construction Drawings"
    ]
  }
}
```

### **Strict Rules:**  
- Do **not** include JSON formatting indicators (e.g., ` ```json ` or ` ``` `).  
- Maintain the exact **structure** and **key names** in the output format.  
- Ensure **all required documents** are present before marking the status as "Complete".  
- If **any document is missing**, the status **must be "Incomplete"** with an explanation.  
"""
    responses = " ".join([response for response in responses])
    payload = {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": prompt
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": responses
                        }
                    ]
                }
            ],
            "max_tokens": 4095
        }
    # Send the request to the OpenAI API
    response_json = call_openai_api(payload=payload)

    # Extract the assistant's message from the response
    assistant_message = response_json['choices'][0]['message']['content']
    # response = parse_response_data(assistant_message.replace("**",""))
    return assistant_message