from sqlalchemy.orm import Session
from app.models.models import Voucher
from app.utils.code_generator import generate_random_voucher_code

# def create_single_voucher(db: Session) -> Voucher:
#     code = generate_random_voucher_code()
#     voucher = Voucher(code=code, is_used=False)
#     db.add(voucher)
#     db.commit()
#     db.refresh(voucher)
#     return voucher
def create_voucher(db: Session, count: int) -> list[Voucher]:
    vouchers = []
    existing_codes = set(
        db.query(Voucher.code).filter(Voucher.code.in_(
            [generate_random_voucher_code() for _ in range(count)]
        )).all()
    )
    while len(vouchers) < count:
        code = generate_random_voucher_code()
        if code not in existing_codes:
            voucher = Voucher(code=code, is_used=False)
            db.add(voucher)
            vouchers.append(voucher)
            existing_codes.add(code)
    db.commit()
    return vouchers

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
