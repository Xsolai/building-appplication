from sqlalchemy.orm import Session
from app.models.models import Voucher
from app.utils.code_generator import generate_random_voucher_code

def create_voucher(db: Session) -> Voucher:
    code = generate_random_voucher_code()
    voucher = Voucher(code=code, is_used=False)
    db.add(voucher)
    db.commit()
    db.refresh(voucher)
    return voucher

def check_voucher(code: str, db: Session) -> bool:
    voucher = db.query(Voucher).filter(Voucher.code == code).first()
    return voucher is not None and not voucher.is_used

def mark_voucher_used(code: str, db: Session):
    voucher = db.query(Voucher).filter(Voucher.code == code).first()
    if voucher and not voucher.is_used:
        voucher.is_used = True
        db.commit()
        return True
    return False
