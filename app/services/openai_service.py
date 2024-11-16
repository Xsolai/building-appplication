from fastapi import HTTPException, status
import openai
from dotenv import load_dotenv
import os
import logging
import requests
from concurrent.futures import ThreadPoolExecutor
from .image_service import encode_images_to_base64, parse_response_data

# Load environment variables from .env file
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# System prompts to guide the model
B_PLAN_SYSTEM_PROMPT = f"Extract all the text that is present in the image. Just focus on the detailed guidelines and provide me in a detailed summary.Also translate into english "
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
You're an experienced AI-powered arhictecture reviewer.
German is your native language
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


def send_to_gpt(encoded_images: list):
    responses = []

    def process_image(encoded_image, index):
        print(f"Processing image {index + 1}")
        payload = {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
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
    return final_response(responses)



def final_response(responses:list):
    prompt = """You will recieve a list of responses. You task is to select the most appropriate detail from it. The format you should follow:
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

# Final method 
def extracting_project_details(images_path = None):
    """
    Method to analyze images that were converted from PDFs.
    """
    try:
        # Ensure the image directory exists
        if not os.path.exists(images_path):
            raise HTTPException(status_code=404, detail="No images found for analysis.")

        # Convert each image to base64
        encoded_images = encode_images_to_base64(images_path=images_path)
        print("encoded images", len(encoded_images))
        return send_to_gpt(encoded_images=encoded_images)
    
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing the image.")
    
    
    
def final_guidlines(responses:list):
    prompt = """You will recieve a list of responses. 
    Your task is to provide all these guidlines or regulation in points so that I can't miss any important information.
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
    response_json = call_openai_api(payload=payload)
    return response_json['choices'][0]['message']['content']
    

def guidlines(b_plan_path: str = None):
    """
    method to analyze images that were converted from PDFs.
    """
    try:
        images_path = b_plan_path

        # Ensure the image directory exists
        if not os.path.exists(images_path):
            raise HTTPException(status_code=404, detail="No images found for analysis.")

        encoded_images = []
        responses = []
        
        encoded_images = encode_images_to_base64(images_path=images_path)
        # print(encoded_images)
        print("encoded images", len(encoded_images))
        def process_image(encoded_image, index):
            print(f"Processing image {index + 1}")
            payload = {
                "model": "gpt-4o",
                "messages": [
                    {
                        "role": "system",
                        "content": B_PLAN_SYSTEM_PROMPT
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
        with ThreadPoolExecutor(max_workers=len(encoded_images)) as executor:
            for i, encoded_image in enumerate(encoded_images):
                executor.submit(process_image, encoded_image, i)

        logger.info("Successfully processed.")
        return final_guidlines(responses)

    except Exception as e:
        logger.error(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing the image.")


def comparison(building_details, guidlines):
    prompt = """  
You will receive two inputs:  
1. **Guidelines:** An text which consists of map and set of rules, regulations, or standards that the building must comply with (e.g., safety protocols, architectural codes, environmental policies, etc.).  
2. **Building Details:** Specific information about the building, such as structural elements, design specifications, materials used, safety measures, or other relevant data.  

**Objective:**  
Your task is to:  
1. **Compare** the building details against the provided guidelines.  
2. **Identify Compliance:** Determine whether the building follows all the specified guidelines.  
3. **Flag Non-compliance:** If there are any deviations or unfulfilled guidelines, list them clearly.

**Output Requirements:**  
1. **Compliance Status of the building:** Indicate whether the building is fully compliant or not.
2. **Details of Non-compliance:** If applicable, list each unfulfilled guideline with a **reason** for non-compliance.
3. **Suggestions (Optional):** If possible, provide suggestions for how the building can meet the guidelines.  

"""
    building_details = " ".join([response for response in building_details])
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
                        "text": guidlines
                    },
                    {
                        "type": "text",
                        "text": building_details
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
        

def check_compliance(b_plan_Path: str = None, images_path:str = None):
    """
    Endpoint to analyze images that were converted from PDFs.
    """
    try:
        # print("images path: ", images_path)
        guidliness = guidlines(b_plan_path=b_plan_Path)
        print("Guidlines:\n\n", guidliness)
        
        # Ensure the image directory exists
        if not os.path.exists(images_path):
            raise HTTPException(status_code=404, detail="No images found for analysis.")

        # Convert each image to base64
        encoded_images = []
        responses = []
        # Convert the image to a base64-encoded string
        encoded_images = encode_images_to_base64(images_path=images_path)
        print("encoded images", len(encoded_images))
        def process_image(encoded_image, index):
            print(f"Processing image {index + 1}")
            payload = {
                "model": "gpt-4o",
                "messages": [
                {
                    "role": "system",
                    "content": CMP_SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": guidliness
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{encoded_image}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 4095
            }
            response_json = call_openai_api(payload=payload)
            assistant_message = response_json['choices'][0]['message']['content']
            # print("Assistant msg:", assistant_message)
            responses.append(assistant_message)

        # Using ThreadPoolExecutor to manage threads
        with ThreadPoolExecutor(max_workers=10) as executor:
            for i, encoded_image in enumerate(encoded_images):
                executor.submit(process_image, encoded_image, i)
        print("Now executing comparison method")
        return comparison(responses, guidlines= guidliness)

    except Exception as e:
        logger.error(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing the image.")
    





def PdfReport(results):
    prompt = """  
I will provide you the result so you should format it in that way that it should look like a pdf report! So that I can use that for future work!

"""
    results = " ".join([response for response in results])
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
    print("Final compliance status:\n\n\n",assistant_message)

    logger.info("Successfully processed.")
    return assistant_message
