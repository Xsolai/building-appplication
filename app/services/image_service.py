from fastapi import HTTPException
from dotenv import load_dotenv
import os
import logging
import base64
from PIL import Image
from io import BytesIO


# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Image.MAX_IMAGE_PIXELS = None


def encode_images_to_base64(images_path):
    image_files = [os.path.join(images_path, file) for file in os.listdir(images_path) if file.endswith(".png")]
    print("image file:", len(image_files))
    encoded_images = []    
    for file in image_files:
        try:
            with Image.open(file) as img:  # Open the image file
                img = img.resize((1024, 1024)) 
                buffered = BytesIO()  # Create a buffer to store the image bytes
                img.save(buffered, format="PNG")  # Save the image to the buffer in PNG format
                img_data = buffered.getvalue()  # Get the raw image data from the buffer
                encoded_image = base64.b64encode(img_data).decode('utf-8')  # Encode the image data as base64
                encoded_images.append(encoded_image)
                # print("Image read successfully")
        except Exception as e:
            logger.error(f"Error processing image {file}: {e}")
            raise HTTPException(status_code=500, detail=f"Error processing image {file}: {e}")
    return encoded_images



def parse_response_data(data):
    # Strip the data and split it into lines
    data = data.replace("**","")
    data = data.replace("-","")
    data = data.replace("\"","")
    lines = data.strip().split("\n")
    print(lines)
    
    result ={}
    for line in lines:
        print(line)
        line_key = line.split(":")[0]
        line_value = line.split(":")[1]
        result[line_key] = line_value
        
    return result
