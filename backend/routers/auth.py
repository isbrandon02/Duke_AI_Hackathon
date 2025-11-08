"""
Authentication router with Firebase token verification examples.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict
from dependencies import get_current_user, get_current_user_optional

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.get("/me")
async def get_current_user_info(current_user: Dict = Depends(get_current_user)):
    """
    Get information about the currently authenticated user.
    
    This endpoint requires a valid Firebase ID token in the Authorization header.
    
    Example request:
        curl -H "Authorization: Bearer <firebase-id-token>" http://localhost:8000/auth/me
    """
    return {
        "uid": current_user.get("uid"),
        "email": current_user.get("email"),
        "email_verified": current_user.get("email_verified", False),
        "authenticated": True,
    }


@router.get("/check")
async def check_authentication(current_user: Dict = Depends(get_current_user_optional)):
    """
    Check if the request is authenticated (optional authentication).
    
    This endpoint works with or without authentication.
    """
    if current_user:
        return {
            "authenticated": True,
            "uid": current_user.get("uid"),
            "email": current_user.get("email"),
        }
    return {"authenticated": False}


@router.post("/verify-token")
async def verify_token(current_user: Dict = Depends(get_current_user)):
    """
    Verify that the provided token is valid.
    
    This is a simple endpoint to test token verification.
    If the token is valid, you'll get a success response.
    If not, you'll get a 401 error.
    """
    return {
        "message": "Token is valid",
        "user": {
            "uid": current_user.get("uid"),
            "email": current_user.get("email"),
        },
    }

