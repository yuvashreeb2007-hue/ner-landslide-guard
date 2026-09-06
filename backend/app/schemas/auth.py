"""
Authentication Pydantic schemas for NER LandslideGuard.
Supports ADMIN, DISTRICT_OFFICER, FIELD_OFFICER, and CITIZEN roles.
"""

from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    DISTRICT_OFFICER = "DISTRICT_OFFICER"
    FIELD_OFFICER = "FIELD_OFFICER"
    CITIZEN = "CITIZEN"

class UserBase(BaseModel):
    username: str
    email: str
    full_name: str
    role: UserRole
    jurisdiction: str
    department: str
    badge_number: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    avatar_url: Optional[str] = None

class LoginRequest(BaseModel):
    username_or_email: str
    password: str

class DemoLoginRequest(BaseModel):
    role: UserRole

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    user: UserResponse

class DemoAccountInfo(BaseModel):
    role: UserRole
    title: str
    username: str
    full_name: str
    department: str
    jurisdiction: str
    badge_number: Optional[str] = None
    description: str
    permissions_summary: List[str]
