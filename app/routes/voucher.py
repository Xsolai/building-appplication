from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.voucher_service import create_voucher, check_voucher, mark_voucher_used

router = APIRouter(prefix="/voucher", tags=["Voucher"])

@router.post("/generate", summary="Generate a new voucher")
def generate_voucher(db: Session = Depends(get_db)):
    voucher = create_voucher(db)
    return {"message": "Voucher generated successfully", "voucher_code": voucher.code}

@router.post("/check", summary="Check if a voucher is valid")
def validate_voucher(code: str, db: Session = Depends(get_db)):
    if not check_voucher(code, db):
        raise HTTPException(status_code=400, detail="Invalid or already used voucher")
    return {"message": "Voucher is valid"}

@router.post("/mark-used", summary="Mark a voucher as used")
def use_voucher(code: str, db: Session = Depends(get_db)):
    if not mark_voucher_used(code, db):
        raise HTTPException(status_code=400, detail="Invalid or already used voucher")
    return {"message": "Voucher marked as used"}
