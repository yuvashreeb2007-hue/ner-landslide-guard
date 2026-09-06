"""
Cryptographic security module for password hashing and JWT token handling.
Uses bcrypt for one-way password hashing and PyJWT for signed Bearer tokens.
"""

import os
import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

# Secret key for JWT signing - configurable via environment variable
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "ner-landslide-guard-secret-key-prod-secure-2026-eoc-assam-sikkim")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hours

def hash_password(password: str) -> str:
    """Hashes a plain text password using bcrypt with random salt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generates a signed JWT access token containing claims."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow()
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a JWT access token signature and expiration."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
