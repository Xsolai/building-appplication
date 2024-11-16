from fastapi import APIRouter, File, UploadFile, HTTPException, status, Response
from fastapi.responses import JSONResponse
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
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, Frame, Spacer, SimpleDocTemplate


CURRENT_DIR = os.path.join(os.getcwd(), "uploads")
router = APIRouter(
    tags=['project']
)


# Function to generate a PDF report
def generate_pdf_report(report_text: str, output_path: str):
    """
    Generate a compliance PDF report with proper formatting.

    Args:
    - report_text: The report content as a string.
    - output_path: The file path to save the PDF report.
    """
    # Create the PDF document
    pdf = SimpleDocTemplate(output_path, pagesize=letter)
    
    # Define styles for the report
    styles = getSampleStyleSheet()
    title_style = styles["Title"]
    subtitle_style = styles["Heading2"]
    body_style = styles["BodyText"]
    
    # Start the story (content to add to the PDF)
    story = []

    # Add Title
    story.append(Paragraph("Compliance Report", title_style))
    story.append(Spacer(1, 12))  # Add some space
    
    # Add a divider
    story.append(Paragraph("------------------------------", body_style))
    story.append(Spacer(1, 12))
    
    # Add sections based on the report text
    for line in report_text.split("\n\n"):  # Splitting by double newlines for sections
        if line.startswith("### "):  # Section Header
            section_title = line[4:]
            story.append(Paragraph(section_title, subtitle_style))
        else:  # Regular content
            story.append(Paragraph(line, body_style))
        story.append(Spacer(1, 12))  # Add some space after each section
    
    # Build the PDF with the story
    pdf.build(story)



# Function to send email with the PDF report attachment and feedback link
def send_email_with_report(to_email: str, pdf_path: str, user_id: int):
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

        # Create the feedback link
        feedback_link = f"http://your-app-url.com/feedback?user_id={user_id}"
        feedback_message = (
            f"Please find the attached compliance report.\n\n"
            f"We value your feedback! To help us improve, please provide your feedback by clicking the link below:\n"
            f"{feedback_link}\n\n"
            "Thank you for using our service!\n"
            "Best Regards,\n"
            "Compliance Review Team"
        )

        # Attach the feedback message
        body = MIMEText(feedback_message, "plain")
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
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(oauth2.get_current_user)
):
    try:
        # file_path = os.path.join(CURRENT_DIR, "B-plan")
        # B_plan_images_path = os.path.join(file_path, "images")
        # os.makedirs(file_path, exist_ok=True)
        # os.makedirs(B_plan_images_path, exist_ok=True)

        # images_dir = os.listdir(os.path.join(CURRENT_DIR, "images"))
        # images_path = os.path.join(CURRENT_DIR, "images", images_dir[-1])
        # logging.info("Images path: %s", images_path)

        # saved_file_path = os.path.join(file_path, file.filename)
        # with open(saved_file_path, "wb") as buffer:
        #     buffer.write(await file.read())
        # logging.info("File_name: %s", file.filename.split(".")[0])

        # # Convert PDF to images
        # process_plan_pdf(saved_file_path, folder_path=B_plan_images_path, project_name="B-plan")
        # logging.info("PDF converted to images successfully")

        # # Check compliance using GPT
        # response = check_compliance(images_path=images_path)
        # logging.info("Compliance check response: %s", response)

        # # Generate PDF report
        # report_path = os.path.join(file_path, "Compliance_Report.pdf")
        # generate_pdf_report(response, report_path)
        # logging.info("PDF report generated: %s", report_path)

        # # Send email with the PDF report attached and feedback link
        # send_email_with_report(to_email=current_user.email, pdf_path=report_path, user_id=current_user.id)

        # return Response(content="Report generated and emailed successfully")
        user = db.query(models.User).filter(models.User.email == current_user.email).first()
        
        # Retrieve the latest project for the user
        latest_project = db.query(models.Document).filter(models.Document.user_id == user.id).order_by(models.Document.uploaded_at.desc()).first()
        # Check if a project exists for this user
        if not latest_project:
            return JSONResponse(content={"error": "No projects found for the user"}, status_code=404)

        file_name = latest_project.file_name
        print("project name: ", file_name)
        
        project_images = os.path.join(CURRENT_DIR, str(user.id), file_name,  "images", "Project_images")
        file_path:str = os.path.join(CURRENT_DIR, str(user.id), file_name,  "B-plan")
        B_plan_images_path = os.path.join(file_path, "images")
        #creating folders
        os.makedirs(file_path,exist_ok=True)
        os.makedirs(B_plan_images_path,exist_ok=True)
        
        saved_file_path = os.path.join(file_path, file.filename)
        with open(os.path.join(file_path, file.filename), "wb") as buffer:
            buffer.write(await file.read())
        print("File_name = ", file.filename.split(".")[-2])

        result = process_plan_pdf(os.path.join(saved_file_path), folder_path= B_plan_images_path, project_name="B-plan")
        logging.info("converted to images Done")
        
        logging.info("sending images to gpt")
        response = check_compliance(b_plan_Path=B_plan_images_path, images_path=project_images)
        logging.info("response: %s", response)

        # Generate PDF report
        report_path = os.path.join(file_path, "Compliance_Report.pdf")
        generate_pdf_report(response, report_path)
        logging.info("PDF report generated: %s", report_path)

        # Send email with the PDF report attached
        send_email_with_report(to_email=user.email, pdf_path=report_path, user_id=user.id)

        return Response(content="Report generated and emailed successfully")


    except Exception as e:
        logging.error("Internal server error: %s", str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

