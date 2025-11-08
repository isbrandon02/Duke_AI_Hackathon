# Firebase Authentication Setup Guide

This guide explains how to set up Firebase Authentication with your FastAPI backend.

## Step 1: Get Firebase Service Account Credentials

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to **Project Settings** (gear icon) → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file securely (e.g., `firebase-service-account.json`)

⚠️ **Important**: Never commit this file to version control! Add it to `.gitignore`.

## Step 2: Configure Backend Environment

You have two options for providing the service account credentials:

### Option A: Service Account File (Recommended for Development)

1. Place the service account JSON file in your backend directory (or any secure location)
2. Add to your `.env` file:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/firebase-service-account.json
   ```

### Option B: Service Account JSON as Environment Variable (Recommended for Deployment)

1. Copy the entire contents of the service account JSON file
2. Add to your `.env` file:
   ```env
   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"..."}'
   ```
   Or set it as an environment variable in your deployment platform.

## Step 3: Test the Integration

1. Start your backend server:

   ```bash
   cd backend
   source ../venv/bin/activate
   uvicorn main:app --reload
   ```

2. Check the console output - you should see:

   - ✅ Firebase Admin SDK initialized with service account file
   - OR
   - ⚠️ Firebase Admin SDK not initialized (if credentials are missing)

3. Test the authentication endpoints:
   - `GET /auth/check` - Works without authentication
   - `GET /auth/me` - Requires a valid Firebase ID token
   - `POST /auth/verify-token` - Requires a valid Firebase ID token

## Step 4: Use in Your Routes

### Protect a Route (Required Authentication)

```python
from dependencies import get_current_user
from fastapi import Depends

@router.get("/protected")
async def protected_route(current_user: Dict = Depends(get_current_user)):
    return {
        "message": "This is a protected route",
        "user_id": current_user["uid"],
        "email": current_user.get("email")
    }
```

### Optional Authentication

```python
from dependencies import get_current_user_optional
from typing import Optional

@router.get("/optional")
async def optional_route(
    current_user: Optional[Dict] = Depends(get_current_user_optional)
):
    if current_user:
        return {"authenticated": True, "user_id": current_user["uid"]}
    return {"authenticated": False}
```

## Step 5: Frontend Integration (React)

In your React frontend, you'll need to:

1. Install Firebase SDK:

   ```bash
   npm install firebase
   ```

2. Initialize Firebase in your React app and send tokens to the backend:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  // ... other config
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Sign in
signInWithEmailAndPassword(auth, email, password).then(
  async (userCredential) => {
    const user = userCredential.user;
    const idToken = await user.getIdToken();

    // Send token to your backend
    const response = await fetch("http://localhost:8000/auth/me", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    const data = await response.json();
    console.log("Authenticated user:", data);
  }
);
```

## Troubleshooting

### Firebase not initialized

- Check that your service account file path is correct
- Verify the JSON content is valid
- Check environment variables are loaded (use `load_dotenv()`)

### Invalid token errors

- Make sure the token is being sent in the `Authorization: Bearer <token>` header
- Verify the token hasn't expired (tokens expire after 1 hour)
- Check that the Firebase project matches between frontend and backend

### CORS errors

- Ensure your frontend origin is allowed in FastAPI CORS settings
- Check that credentials are being sent with requests

## Security Notes

- ✅ Always verify tokens on the backend (never trust client-side only)
- ✅ Use HTTPS in production
- ✅ Store service account credentials securely
- ✅ Never expose service account keys in client-side code
- ✅ Use environment variables for sensitive configuration
