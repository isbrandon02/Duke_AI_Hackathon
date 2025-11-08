from typing import Optional
from datetime import datetime
from schemas.auth import User, UserCreate
from services.auth import get_password_hash, verify_password
from services.database import get_database
from bson import ObjectId

async def get_user_by_username(username: str) -> Optional[dict]:
    """Get a user by username."""
    db = get_database()
    if db is None:
        return None
    user = await db.users.find_one({"username": username})
    if user:
        user["id"] = str(user["_id"])
        user.pop("_id", None)
    return user

async def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get a user by ID."""
    db = get_database()
    if db is None:
        return None
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user:
            user["id"] = str(user["_id"])
            user.pop("_id", None)
        return user
    except Exception:
        return None

async def create_user(user_create: UserCreate) -> dict:
    """Create a new user."""
    db = get_database()
    if db is None:
        raise ValueError("Database connection not available")
    
    # Check if user already exists
    existing_user = await get_user_by_username(user_create.username)
    if existing_user:
        raise ValueError("Username already exists")
    
    # Create new user document
    user_doc = {
        "username": user_create.username,
        "email": user_create.email,
        "full_name": user_create.full_name,
        "hashed_password": get_password_hash(user_create.password),
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    
    # Insert user into database
    result = await db.users.insert_one(user_doc)
    
    # Return user with string ID
    user_doc["id"] = str(result.inserted_id)
    user_doc.pop("_id", None)
    return user_doc

async def authenticate_user(username: str, password: str) -> Optional[dict]:
    """Authenticate a user by username and password."""
    user = await get_user_by_username(username)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    if not user.get("is_active", True):
        return None
    return user

# Initialize default admin user if it doesn't exist
async def init_default_user():
    """Create default admin user if it doesn't exist."""
    db = get_database()
    if db is None:
        return
    
    existing_admin = await get_user_by_username("admin")
    if not existing_admin:
        try:
            await create_user(UserCreate(
                username="admin",
                email="admin@example.com",
                password="secret",
                full_name="Admin User"
            ))
            print("✅ Created default admin user (username: admin, password: secret)")
        except Exception as e:
            print(f"⚠️  Could not create default admin user: {e}")
