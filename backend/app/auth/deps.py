"""
FastAPI Authentication & RBAC Route Dependencies.
Validates Bearer JWTs and checks role permissions.
"""

from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.security import decode_access_token
from app.schemas.auth import UserRole, UserResponse
from app.services.user_service import user_service

security_bearer = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> UserResponse:
    """Extracts and validates user from Bearer JWT in Authorization header."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token claims.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_service.to_user_response(user)

def require_roles(allowed_roles: List[UserRole]):
    """Decorator dependency to enforce role-based access control on routes."""
    def role_checker(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
        if current_user.role not in allowed_roles and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Insufficient privileges. Required role(s): {[r.value for r in allowed_roles]}. Your role: {current_user.role.value}"
            )
        return current_user
    return role_checker
