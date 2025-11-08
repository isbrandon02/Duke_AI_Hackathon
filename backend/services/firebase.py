"""
Firebase Authentication service for verifying ID tokens.
"""
import os
import firebase_admin
from firebase_admin import credentials, auth
from typing import Optional, Dict
import json

# Global variable to track if Firebase is initialized
_firebase_app: Optional[firebase_admin.App] = None


def initialize_firebase() -> Optional[firebase_admin.App]:
    """
    Initialize Firebase Admin SDK.
    
    Supports two methods:
    1. Service account JSON file (recommended for production)
       - Set FIREBASE_SERVICE_ACCOUNT_PATH environment variable
    2. Service account JSON as environment variable (for deployment)
       - Set FIREBASE_SERVICE_ACCOUNT_JSON environment variable
    
    Returns:
        Firebase App instance or None if initialization fails
    """
    global _firebase_app
    
    if _firebase_app is not None:
        return _firebase_app
    
    try:
        # Method 1: Service account file path
        service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            _firebase_app = firebase_admin.initialize_app(cred)
            print("✅ Firebase Admin SDK initialized with service account file")
            return _firebase_app
        
        # Method 2: Service account JSON as environment variable
        service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        if service_account_json:
            try:
                # Parse the JSON string
                service_account_info = json.loads(service_account_json)
                cred = credentials.Certificate(service_account_info)
                _firebase_app = firebase_admin.initialize_app(cred)
                print("✅ Firebase Admin SDK initialized with service account JSON")
                return _firebase_app
            except json.JSONDecodeError:
                print("⚠️  FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON")
        
        # Method 3: Try default credentials (for Google Cloud environments)
        try:
            _firebase_app = firebase_admin.initialize_app()
            print("✅ Firebase Admin SDK initialized with default credentials")
            return _firebase_app
        except Exception:
            pass
        
        print("⚠️  Firebase Admin SDK not initialized. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON")
        return None
        
    except Exception as e:
        print(f"❌ Error initializing Firebase Admin SDK: {e}")
        return None


def verify_id_token(id_token: str) -> Optional[Dict]:
    """
    Verify a Firebase ID token and return the decoded token.
    
    Args:
        id_token: The Firebase ID token to verify
        
    Returns:
        Decoded token dict with user information (uid, email, etc.) or None if invalid
    """
    # Ensure Firebase is initialized
    if _firebase_app is None:
        initialize_firebase()
    
    if _firebase_app is None:
        print("⚠️  Firebase not initialized, cannot verify token")
        return None
    
    try:
        # Verify the ID token
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except auth.InvalidIdTokenError:
        print("❌ Invalid ID token")
        return None
    except auth.ExpiredIdTokenError:
        print("❌ Expired ID token")
        return None
    except Exception as e:
        print(f"❌ Error verifying ID token: {e}")
        return None


def get_user_by_uid(uid: str) -> Optional[Dict]:
    """
    Get user information from Firebase by UID.
    
    Args:
        uid: Firebase user UID
        
    Returns:
        User record dict or None if not found
    """
    # Ensure Firebase is initialized
    if _firebase_app is None:
        initialize_firebase()
    
    if _firebase_app is None:
        return None
    
    try:
        user_record = auth.get_user(uid)
        return {
            "uid": user_record.uid,
            "email": user_record.email,
            "email_verified": user_record.email_verified,
            "display_name": user_record.display_name,
            "photo_url": user_record.photo_url,
            "disabled": user_record.disabled,
        }
    except Exception as e:
        print(f"❌ Error getting user by UID: {e}")
        return None

