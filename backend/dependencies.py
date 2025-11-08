"""
FastAPI dependencies for authentication and authorization.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Optional
from services.firebase import verify_id_token, initialize_firebase

# Security scheme for Bearer token authentication
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict:
    """
    FastAPI dependency to verify Firebase ID token and get current user.
    
    Usage:
        @router.get("/protected")
        async def protected_route(current_user: Dict = Depends(get_current_user)):
            return {"user_id": current_user["uid"]}
    
    Args:
        credentials: HTTP Bearer token credentials from the Authorization header
        
    Returns:
        Decoded Firebase token with user information (uid, email, etc.)
        
    Raises:
        HTTPException: If token is missing, invalid, or expired
    """
    # Initialize Firebase if not already initialized
    initialize_firebase()
    
    # Extract the token from the Bearer credentials
    id_token = credentials.credentials
    
    # Verify the token
    decoded_token = verify_id_token(id_token)
    
    if decoded_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return decoded_token


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[Dict]:
    """
    FastAPI dependency to optionally verify Firebase ID token.
    
    This is useful for endpoints that work both with and without authentication.
    
    Usage:
        @router.get("/optional-auth")
        async def optional_route(current_user: Optional[Dict] = Depends(get_current_user_optional)):
            if current_user:
                return {"user_id": current_user["uid"], "authenticated": True}
            return {"authenticated": False}
    
    Args:
        credentials: Optional HTTP Bearer token credentials
        
    Returns:
        Decoded Firebase token if valid, None otherwise
    """
    if credentials is None:
        return None
    
    initialize_firebase()
    id_token = credentials.credentials
    decoded_token = verify_id_token(id_token)
    return decoded_token

