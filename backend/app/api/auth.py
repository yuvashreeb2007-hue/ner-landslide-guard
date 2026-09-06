"""
Authentication REST API Endpoints for NER LandslideGuard.
Supports credential login, token verification, and one-click role switching in Demo Mode.
"""

from typing import List
from datetime import timedelta
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import (
    LoginRequest,
    DemoLoginRequest,
    TokenResponse,
    UserResponse,
    DemoAccountInfo,
    UserRole
)
from app.services.user_service import user_service
from app.auth.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.auth.deps import get_current_user

auth_router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])

@auth_router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """
    Authenticates a user via username/email and password.
    Returns signed Bearer JWT token and user profile metadata.
    """
    user = user_service.authenticate_user(req.username_or_email, req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password. Please verify credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_resp = user_service.to_user_response(user)
    token_claims = {
        "sub": user_resp.id,
        "username": user_resp.username,
        "role": user_resp.role.value,
        "jurisdiction": user_resp.jurisdiction
    }

    access_token = create_access_token(
        data=token_claims,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in_seconds=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_resp
    )

@auth_router.post("/demo-login", response_model=TokenResponse)
async def demo_login(req: DemoLoginRequest):
    """
    Convenience endpoint for Demo Mode:
    Instantly generates signed JWT token for the requested role persona without exposing credentials.
    """
    user = user_service.get_user_by_role(req.role)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No demo persona configured for role {req.role.value}."
        )

    user_resp = user_service.to_user_response(user)
    token_claims = {
        "sub": user_resp.id,
        "username": user_resp.username,
        "role": user_resp.role.value,
        "jurisdiction": user_resp.jurisdiction
    }

    access_token = create_access_token(
        data=token_claims,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in_seconds=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_resp
    )

@auth_router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    """Returns currently authenticated user profile from token claims."""
    return current_user

@auth_router.get("/demo-accounts", response_model=List[DemoAccountInfo])
async def get_demo_accounts():
    """
    Returns public metadata (Role, Title, Department, Description) of available demo accounts.
    Does NOT return or expose passwords.
    """
    return user_service.get_demo_accounts_info()
