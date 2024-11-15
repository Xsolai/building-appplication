import os
import fitz  # PyMuPDF
from PIL import Image
import unicodedata
import logging
import traceback

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
    
    



def process_pdf(pdf_path, dpi=300, folder_path: str = None, project_name: str = None):
    try:
        logging.info(f"Opening PDF: {pdf_path}")
        doc = fitz.open(pdf_path)
    except Exception as e:
        logging.error(f"Failed to open PDF: {str(e)}")
        logging.error(traceback.format_exc())
        return []

    image_paths = []
    logging.info(f"Number of pages: {len(doc)}")

    for i in range(len(doc)):
        try:
            page = doc[i]
            zoom = dpi / 72
            mat = fitz.Matrix(zoom, zoom)

            pix = page.get_pixmap(matrix=mat, alpha=False)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

            doc_name = doc.name.split(f"{project_name}{os.path.sep}")[1].split(".pdf")[0]
            img_path = os.path.join(folder_path, f"{doc_name}_page_{i + 1}.png")

            logging.info(f"Saving image to {img_path}")
            img.save(img_path, format="PNG", dpi=(dpi, dpi), quality=95)

            image_paths.append(img_path)

        except Exception as e:
            logging.error(f"Error processing page {i + 1}: {str(e)}")
            logging.error(traceback.format_exc())

    doc.close()
    logging.info("PDF to image conversion complete.")
    return image_paths


def process_plan_pdf(pdf_path, dpi=300, folder_path: str = None, project_name: str = None):
    """
    Convert each page of the PDF into high-quality images split into left and right halves.

    Args:
    pdf_path (str): Path to the PDF file.
    dpi (int): Dots per inch for image resolution (default: 300).
    current_dir (str): Directory where images will be saved.
    project_name (str): Optional project name for organizing output files.

    Returns:
    list: Paths to the extracted images (both left and right halves).
    """
    # folder_path = os.path.join(current_dir, "images")
    # os.makedirs(folder_path, exist_ok=True)
    doc = fitz.open(pdf_path)
    image_paths = []

    logging.info(f"Number of pages: {len(doc)}")
    logging.info("Converting PDF pages to images with left and right splits.")

    for i in range(len(doc)):
        page = doc[i]

        # Set the matrix for higher resolution
        zoom = dpi / 72  # 72 is the default PDF resolution
        mat = fitz.Matrix(zoom, zoom)

        # Get the pixmap with higher resolution
        pix = page.get_pixmap(matrix=mat, alpha=False)

        # Convert pixmap to PIL Image
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

        # Calculate dimensions for the left and right halves
        width, height = img.size
        mid_width = width // 2

        # Crop the left half
        left_half = img.crop((0, 0, mid_width, height))
        left_img_path = os.path.join(folder_path, f"{project_name}_page_{i + 1}_left.png")
        left_half.save(left_img_path, format="PNG", dpi=(dpi, dpi), quality=95)
        image_paths.append(left_img_path)

        # Crop the right half
        right_half = img.crop((mid_width, 0, width, height))
        right_img_path = os.path.join(folder_path, f"{project_name}_page_{i + 1}_right.png")
        right_half.save(right_img_path, format="PNG", dpi=(dpi, dpi), quality=95)
        image_paths.append(right_img_path)

    doc.close()
    return folder_path