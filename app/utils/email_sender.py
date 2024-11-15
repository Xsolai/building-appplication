import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from app.database.database import SessionLocal
from app.models.models import User
from email.mime.base import MIMEBase
from email import encoders 
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SYSTEM_ADMIN_EMAIL = os.getenv("SYSTEM_ADMIN_EMAIL")

def send_email_notification(user_email: str, user_name: str):
    try:
        subject = "New User Started the Review Process"
        body = f"User '{user_name}' with email '{user_email}' has started the review process."

        msg = MIMEMultipart()
        msg["From"] = SMTP_USERNAME
        msg["To"] = SYSTEM_ADMIN_EMAIL
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)

        print(f"Notification email sent to {SYSTEM_ADMIN_EMAIL}")
    except Exception as e:
        print(f"Error sending email: {str(e)}")
