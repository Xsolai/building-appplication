from fastapi import APIRouter, File, UploadFile, HTTPException, status, Response
from fastapi.responses import JSONResponse
import os, json
import logging
from ..services.pdf_service import process_plan_pdf
from ..services.file_service import save_bplan_into_db, save_bplan_details_into_db, save_cmp_details_into_db
from ..services.openai_service import extracting_bplan_details, comparison, PdfReport
from ..database.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from ..models import models, schemas
from ..authentication import oauth2
from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.mime.text import MIMEText
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.units import inch
from app.utils.utils import extract_project_details_as_string , extract_bplan_details_as_string, mapping


CURRENT_DIR = os.path.join(os.getcwd(), "uploads")
router = APIRouter(
    tags=['project']
)

def generate_pdf_report(report_text: str, output_path: str):
    """
    Generate a comprehensive and professionally formatted PDF report.

    Args:
    - report_text: The document content as a string
    - output_path: The file path to save the PDF report
    """
    report_text = report_text.replace(":**", "")
    # report_text = report_text.replace("**:", "")
    # Create the PDF document
    pdf = SimpleDocTemplate(output_path, pagesize=letter, 
                            rightMargin=72, leftMargin=72, 
                            topMargin=72, bottomMargin=18)
    
    # Define styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = styles['Title'].clone('Title')
    title_style.fontSize = 16
    title_style.textColor = colors.darkblue
    
    section_style = styles['Heading2'].clone('SectionHeading')
    section_style.fontSize = 14
    section_style.textColor = colors.darkblue
    section_style.spaceAfter = 12
    
    subsection_style = styles['Heading3'].clone('SubsectionHeading')
    subsection_style.fontSize = 12
    subsection_style.textColor = colors.navy
    subsection_style.spaceAfter = 6
    
    body_style = styles['BodyText'].clone('BodyText')
    body_style.fontSize = 10
    body_style.leading = 14
    
    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=body_style,
        leftIndent=20,
        bulletIndent=10,
        spaceAfter=6,
        bulletText='•'
    )
    
    bold_style = styles['BodyText'].clone('BoldStyle')
    bold_style.fontName = 'Helvetica-Bold'
    
    # Prepare the content
    story = []

    # Add a Title
    story.append(Paragraph("Building Compliance Report", title_style))
    story.append(Spacer(1, 0.25*inch))

    # Process the document content
    lines = report_text.split('\n')
    
    for line in lines:
        line = line.strip()
        
        # Handle main headings
        if line.startswith('### '):
            story.append(Paragraph(line[4:], section_style))
            story.append(Spacer(1, 0.1*inch))
        
        # Handle subheadings
        elif line.startswith('- **'):
            # Remove ** and create a bold paragraph
            clean_line = line[4:]
            story.append(Paragraph(clean_line, bold_style))
        
        # Handle bullet points
        elif line.startswith('- '):
            # Remove the '- ' and create a bullet point
            story.append(Paragraph(line[2:], bullet_style))
        
        # Handle regular text
        elif line and not line.startswith('#'):
            story.append(Paragraph(line, body_style))
        
        # Add some space between sections
        if line:
            story.append(Spacer(1, 0.1*inch))
    
    # Build the PDF
    pdf.build(story)
    
    print(f"PDF report generated successfully at {output_path}")


# Function to send email with the PDF report attachment and feedback link
def send_email_with_report(to_email: str, pdf_path: str, user_id: int):
    try:
        from_email = "sabasaeed410@gmail.com"
        from_password = "bzns rnnc yaic jjko"
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
        # Validate file type (only .zip allowed)
        if not file.filename.endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only .pdf files are allowed."
            )
        
        user = db.query(models.User).filter(models.User.email == current_user.email).first()
        if not user:
            return JSONResponse(content={"error": "No user found"}, status_code=404)
        # Retrieve the latest project for the user
        logging.info("Extracting project details.")
        latest_project = db.query(models.Document).filter(models.Document.user_id == user.id).order_by(models.Document.uploaded_at.desc()).first()
        if not latest_project:
            return JSONResponse(content={"error": "No projects found for the user"}, status_code=404)

        file_name = latest_project.file_name
        logging.info(f"Extracting info for the project {file_name}.")
        file_path:str = os.path.join(CURRENT_DIR, str(user.id), file_name,  "B-plan")
        B_plan_images_path = os.path.join(file_path, "images")
        #creating folders
        os.makedirs(file_path,exist_ok=True)
        os.makedirs(B_plan_images_path,exist_ok=True)
        
        saved_file_path = os.path.join(file_path, file.filename)
        with open(os.path.join(file_path, file.filename), "wb") as buffer:
            buffer.write(await file.read())
            
        bplan_name = file.filename.split(".")[-2]
        print("File_name = ", file.filename.split(".")[-2])

        result = process_plan_pdf(os.path.join(saved_file_path), folder_path= B_plan_images_path, project_name="B-plan")
        logging.info("converted BPlan pdf into images")
        
        logging.info("sending BPlan images to gpt")
        # response = check_compliance(b_plan_Path=B_plan_images_path, images_path=project_images)
        extracted_details = extracting_bplan_details(db=db,b_plan_path=B_plan_images_path, user_id=user.id, doc_id=latest_project.id)
        duration = extracted_details.get("total_time")
        response = extracted_details.get("result")
        logging.info("response: %s", response)
        
        logging.info("saving bplan info into db.")
        bplan_id = save_bplan_into_db(db=db, user_id=user.id, bplan_name=bplan_name, doc_id=latest_project.id)
        
        logging.info("saving bplan details info into db.")
        # save_bplan_details_into_db(
        #         db=db,
        #         user_id=user.id,
        #         document_id=latest_project.id,
        #         bplan_id=bplan_id,
        #         duration=duration,
        #         location_within_building_zone=response.get("location_within_building_zone"),
        #         building_use_type=response.get("building_use_type"),
        #         building_style=response.get("building_style"),
        #         grz=response.get("grz"),
        #         gfz=response.get("gfz"),
        #         building_height=response.get("building_height"),
        #         number_of_floors=response.get("number_of_floors"),
        #         roof_shape=response.get("roof_shape"),
        #         dormers=response.get("dormers"),
        #         roof_orientation=response.get("roof_orientation"),
        #         parking_spaces=response.get("parking_spaces"),
        #         outdoor_space=response.get("outdoor_space"),
        #         setback_area=response.get("setback_area"),
        #         setback_relevant_filling_work=response.get("setback_relevant_filling_work"),
        #         deviations_from_b_plan=response.get("deviations_from_b_plan"),
        #         exemptions_required=response.get("exemptions_required"),
        #         species_protection_check=response.get("species_protection_check"),
        #         compliance_with_zoning_rules=response.get("compliance_with_zoning_rules"),
        #         compliance_with_building_codes=response.get("compliance_with_building_codes")
        #     )
        save_bplan_details_into_db(
                db=db,
                user_id=user.id,
                document_id=latest_project.id,
                bplan_id=bplan_id,
                duration=duration,
                **{key: response.get(value) for key, value in mapping.items()}
            )
        logging.info("saved into db.")
        logging.info("Now, extracting project and bplan details for comparison.")
        project_details_id, project_details = extract_project_details_as_string(db, doc_id=latest_project.id)
        print("Project Details: \n\n", project_details)
        bplan_details_id, bplan_details = extract_bplan_details_as_string(db, doc_id=latest_project.id, bplan_id=1)
        print("BPlan Details: \n\n", bplan_details)
        
        comparison_response = comparison(project_details=project_details, bplan_details=bplan_details)
        # print("Comparison response: ", comparison_response)
        # if "```json" in comparison_response:
        #     comparison_response = comparison_response.replace("```json", "")
        #     comparison_response = comparison_response.replace("```", "")
        
        cleaned_response = json.loads(comparison_response)
        print("Cleaned response: \n\n", cleaned_response)
        # print("Status: ", cleaned_response.get("overall_status"))
        logging.info("Saving compliance details into db.")
        # save_cmp_details_into_db(
        #     db=db,
        #     user_id=user.id,
        #     document_id=latest_project.id,
        #     bplan_id=1,
        #     proj_detail_id=project_details_id,
        #     bplan_detail_id=bplan_details_id,
        #     compliant_status=cleaned_response.get("overall_status") if cleaned_response.get("overall_status") else None,
        #     location_within_building_zone=cleaned_response.get("location_within_building_zone") if cleaned_response.get("location_within_building_zone") else None,
        #     building_use_type=cleaned_response.get("building_use_type") if cleaned_response.get("building_use_type") else None,
        #     grz=cleaned_response.get("grz") if cleaned_response.get("grz") else None,
        #     gfz=cleaned_response.get("gfz") if cleaned_response.get("gfz") else None,
        #     building_height=cleaned_response.get("building_height") if cleaned_response.get("building_height") else None,
        #     number_of_floors=cleaned_response.get("number_of_floors") if cleaned_response.get("number_of_floors") else None,
        #     roof_shape=cleaned_response.get("roof_shape") if cleaned_response.get("roof_shape") else None,
        #     dormers=cleaned_response.get("dormers") if cleaned_response.get("dormers") else None,
        #     roof_orientation=cleaned_response.get("roof_orientation") if cleaned_response.get("roof_orientation") else None,
        #     parking_spaces=cleaned_response.get("parking_spaces") if cleaned_response.get("parking_spaces") else None,
        #     outdoor_space=cleaned_response.get("outdoor_space") if cleaned_response.get("outdoor_space") else None,
        #     setback_area=cleaned_response.get("setback_area") if cleaned_response.get("setback_area") else None,
        #     setback_relevant_filling_work=cleaned_response.get("setback_relevant_filling_work") if cleaned_response.get("setback_relevant_filling_work") else None,
        #     deviations_from_b_plan=cleaned_response.get("deviations_from_b_plan") if cleaned_response.get("deviations_from_b_plan") else None,
        #     exemptions_required=cleaned_response.get("exemptions_required") if cleaned_response.get("exemptions_required") else None,
        #     species_protection_check=cleaned_response.get("species_protection_check") if cleaned_response.get("species_protection_check") else None,
        #     compliance_with_zoning_rules=cleaned_response.get("compliance_with_zoning_rules") if cleaned_response.get("compliance_with_zoning_rules") else None,
        #     compliance_with_building_codes=cleaned_response.get("compliance_with_building_codes") if cleaned_response.get("compliance_with_building_codes") else None,
        # )
        save_cmp_details_into_db(
            db=db,
            user_id=user.id,
            document_id=latest_project.id,
            bplan_id=1,
            proj_detail_id=project_details_id,
            bplan_detail_id=bplan_details_id,
            compliant_status=cleaned_response.get("overall_status") if cleaned_response.get("overall_status") else None,
            **{key: cleaned_response.get(value) for key, value in mapping.items()}
        )
        logging.info("saved compliance details into db.")
        
        # Generate PDF report
        report_path = os.path.join(file_path, "Compliance_Report.pdf")
        response = json.dumps(cleaned_response)
        pdf_content = PdfReport(results=response)
        # print("PDF content: \n", pdf_content)
        logging.info(f"generating pdf...")
        generate_pdf_report(pdf_content, report_path)
        logging.info("PDF report generated: %s", report_path)
        try:
            # Send email with the PDF report attached
            send_email_with_report(to_email=user.email, pdf_path=report_path, user_id=user.id)
            logging.info("Email sent with report.")
        except Exception as e:
            logging.error(f"Error sending email: {e}")
            print(f"Error sending email: {e}")

        return {
            "message": "Compliance report generated and sent to your email",
            "Test date": latest_project.uploaded_at,
            # "result": cmp_response_list
            "result": cleaned_response
        }


    except Exception as e:
        logging.error("Internal server error: %s", str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

