from fastapi import APIRouter, File, UploadFile, HTTPException, status, Response
import os
import logging
from ..services.pdf_service import process_pdf, process_plan_pdf
from ..services.openai_service import check_compliance, PdfReport
from ..database.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from ..models import models, schemas
from ..authentication import oauth2
import shutil


from ..authentication import oauth2
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.mime.text import MIMEText

CURRENT_DIR = os.path.join(os.getcwd(), "uploads")
router = APIRouter(
    tags=['project']
)


# Function to generate a PDF report
def generate_pdf_report(report_text: str, output_path: str):
    pdf = canvas.Canvas(output_path, pagesize=letter)
    pdf.setTitle("Compliance Report")
    pdf.drawString(100, 750, "Compliance Report")
    pdf.drawString(100, 730, "------------------------------")
    
    y = 700
    for line in report_text.split("\n"):
        pdf.drawString(100, y, line)
        y -= 20
        if y < 40:  # Create a new page if text exceeds
            pdf.showPage()
            y = 750
    
    pdf.save()


# Function to send email with the PDF report attachment
def send_email_with_report(to_email: str, pdf_path: str):
    try:
        from_email = "alihasnain2k19@gmail.com"
        from_password = "ghnh erzs xxfx znrq"
        smtp_server = "smtp.gmail.com"
        smtp_port = 587

        # Create the email message
        message = MIMEMultipart()
        message["From"] = from_email
        message["To"] = to_email
        message["Subject"] = "Compliance Report"

        # Attach the PDF report
        with open(pdf_path, "rb") as pdf_file:
            pdf_attachment = MIMEApplication(pdf_file.read(), _subtype="pdf")
            pdf_attachment.add_header(
                "Content-Disposition", "attachment", filename=os.path.basename(pdf_path)
            )
            message.attach(pdf_attachment)

        # Attach a simple text message
        body = MIMEText("Please find the attached compliance report.", "plain")
        message.attach(body)

        # Send the email
        with SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(from_email, from_password)
            server.send_message(message)

        logging.info("Email sent successfully to %s", to_email)

    except Exception as e:
        logging.error("Failed to send email: %s", str(e))




@router.post('/upload-B-Plan/')
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: schemas.User = Depends(oauth2.get_current_user)):

    try:
        file_path = os.path.join(CURRENT_DIR, "B-plan")
        B_plan_images_path = os.path.join(file_path, "images")
        os.makedirs(file_path, exist_ok=True)
        os.makedirs(B_plan_images_path, exist_ok=True)

        images_dir = os.listdir(os.path.join(CURRENT_DIR, "images"))
        images_path = os.path.join(CURRENT_DIR, "images", images_dir[-1])
        logging.info("Images path: %s", images_path)

        saved_file_path = os.path.join(file_path, file.filename)
        with open(saved_file_path, "wb") as buffer:
            buffer.write(await file.read())
        logging.info("File_name: %s", file.filename.split(".")[0])

        # Convert PDF to images
        process_plan_pdf(saved_file_path, folder_path=B_plan_images_path, project_name="B-plan")
        logging.info("PDF converted to images successfully")

        # Check compliance using GPT
        response = check_compliance(images_path=images_path)
        logging.info("Compliance check response: %s", response)

        # Generate PDF report
        report_path = os.path.join(file_path, "Compliance_Report.pdf")
        generate_pdf_report(response, report_path)
        logging.info("PDF report generated: %s", report_path)

        # Send email with the PDF report attached
        send_email_with_report(to_email=current_user.email, pdf_path=report_path)

        return Response(content="Report generated and emailed successfully")

    except Exception as e:
        logging.error("Internal server error: %s", str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    finally:
        # Clean up the directory after processing
        shutil.rmtree(file_path, ignore_errors=True)
