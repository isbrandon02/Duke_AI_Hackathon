# Team Setup Guide - Firebase Authentication

This guide helps team members set up Firebase Authentication for the backend.

## Quick Setup (5 minutes)

### Step 1: Get Your Own Firebase Service Account Key

Each team member needs their own Firebase service account key. Here's how:

1. **Go to Firebase Console**

   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Select the Team's Firebase Project**

   - Ask your team lead for the Firebase project name
   - OR if you have access, select the project from the list

3. **Get Service Account Key**

   - Click the ⚙️ gear icon → **Project Settings**
   - Go to **Service Accounts** tab
   - Click **Generate new private key**
   - Click **Generate key** in the confirmation dialog
   - A JSON file will download

4. **Save the File**
   - Move the downloaded file to: `backend/firebase-service-account.json`
   - The file should be in: `/path/to/Duke_AI_Hackathon/backend/firebase-service-account.json`

### Step 2: Configure .env File

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Create or edit .env file**

   ```bash
   # If .env doesn't exist, create it:
   touch .env

   # Or edit existing one:
   code .env
   # or
   nano .env
   ```

3. **Add this line to .env**

   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```

4. **Your .env should look like:**
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   PORT=8000
   FRONTEND_ORIGIN=http://localhost:5173
   ```

### Step 3: Verify Setup

1. **Check files exist**

   ```bash
   cd backend
   ls -la firebase-service-account.json .env
   ```

   Both files should be listed.

2. **Test Firebase initialization**

   ```bash
   source ../venv/bin/activate
   uvicorn main:app --reload
   ```

   Look for this message:

   - ✅ `Firebase Admin SDK initialized with service account file` (SUCCESS!)

## Important Notes

### 🔒 Security

- **Never commit** `firebase-service-account.json` to Git (it's already in `.gitignore`)
- **Never commit** `.env` to Git (it's already in `.gitignore`)
- Each team member should have their own service account key
- If you accidentally commit these files, regenerate the key immediately

### 🤝 Sharing Firebase Project

- All team members should use the **same Firebase project**
- Each person gets their own service account key, but from the same project
- This ensures everyone is testing against the same Firebase Authentication setup

### 🚨 Troubleshooting

**Problem: "File not found"**

- Make sure `firebase-service-account.json` is in the `backend` directory
- Check the filename is exactly: `firebase-service-account.json`

**Problem: "Firebase not initialized"**

- Check your `.env` file has the correct variable name
- Verify the path in `.env` matches where your JSON file is located
- Make sure the JSON file is valid (open it and check it's proper JSON)

**Problem: "Invalid credentials"**

- Make sure you downloaded the key from the correct Firebase project
- Verify the JSON file wasn't corrupted during download
- Try generating a new key from Firebase Console

## Need Help?

1. Check `FIREBASE_SETUP.md` for detailed instructions
2. Check `FIREBASE_SETUP_STEPS.md` for step-by-step guide with screenshots
3. Ask your team lead for the Firebase project name/access

## Quick Checklist

- [ ] Downloaded Firebase service account key
- [ ] Saved file as `backend/firebase-service-account.json`
- [ ] Created/edited `backend/.env` file
- [ ] Added `FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json` to `.env`
- [ ] Tested server startup - saw "Firebase Admin SDK initialized" message
