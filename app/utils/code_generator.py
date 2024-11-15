import string
import secrets

def generate_random_voucher_code(length=10):
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))
