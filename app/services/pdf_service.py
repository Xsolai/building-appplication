import os
import fitz  # PyMuPDF
from PIL import Image
import unicodedata
import logging


# Normalize filenames to ensure special characters are handled consistently
def normalize_filename(filename):
    return unicodedata.normalize('NFC', filename)



def formal_checking(docs: list):
    remaining_files = []
    all_files = []
    
    # List of required document names
    docs_names = [
        "4-KO-Baubeschreibung.pdf", 
        "4-KO-Flaechen.pdf",
        "410_Plaene_4_KO-Kindergarten Obersuhl A1.pdf", 
        "405_Freilflaechen_4_KO-Kindergarten Obersuhl A3.pdf",
        "406_Abstandsflaechen_4_KO-Kindergarten Obersuhl A3.pdf", 
        "KO-Neubau einer Kinderkrippe-bab_01 Bauantrag1.pdf", 
        "KO-Neubau einer Kinderkrippe-bab_34 Barrierefreiheit öffentl. Gebäude2.pdf",
        "KO-HE_Baugenehmigung_ausfuellen9332165.pdf", 
        "KO-Neubau einer Kinderkrippe-bab_28 Einvernehmen der Gemeinde.pdf"
    ]
    
    # Normalize both the docs list and docs_names to handle special characters
    normalized_docs = [normalize_filename(doc) for doc in docs]
    
    for required_file in docs_names:
        normalized_required_file = normalize_filename(required_file)
        if normalized_required_file in normalized_docs:
            print("Found:", required_file)
            all_files.append(required_file)
        else:
            remaining_files.append(required_file)
    
    # Prepare the final message
    if remaining_files:
        missing_files = ", ".join(remaining_files)
        return f"These files are missing: {missing_files}."
    else:
        return "All files are present."
    
    

def process_pdf(pdf_path, dpi=300, current_dir: str = None, project_name: str = None):
    """
    Convert each page of the PDF into a high-quality image using PyMuPDF.
    
    Args:
    pdf_path (str): Path to the PDF file
    dpi (int): Dots per inch for image resolution (default: 300)
    
    Returns:
    list: Paths to the extracted images
    """
    folder_path = os.path.join(current_dir, "images")
    os.makedirs(folder_path, exist_ok=True)
    doc = fitz.open(pdf_path)
    image_paths = []
    
    logging.info(len(doc))
    logging.info("converting pdfs to images.")
    # print(f"Range of docs", range((len(doc)+1)))
    for i in range(len(doc)):
        page = doc[i]
        
        # Set the matrix for higher resolution
        zoom = dpi / 72  # 72 is the default PDF resolution
        mat = fitz.Matrix(zoom, zoom)
        
        # Get the pixmap using the matrix for higher resolution
        pix = page.get_pixmap(matrix=mat, alpha=False)
        
        # Convert pixmap to PIL Image
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        
        # Save the image with high quality
        # print(folder_path)
        doc_name = doc.name.split(f"{project_name}\\")[1].split(".pdf")[0]
        img_path = os.path.join(folder_path, f"{doc_name}_page_{i + 1}.png")
        img.save(img_path, format="PNG", dpi=(dpi, dpi), quality=95)
        
        image_paths.append(img_path)
    
    doc.close()
    return image_paths

