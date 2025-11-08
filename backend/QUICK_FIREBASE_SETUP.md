# Quick Firebase Setup Guide - Steps 1 & 2

## Step 1: Get Firebase Service Account Key (5 minutes)

### Visual Guide:

1. **Go to Firebase Console**

   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Select Your Project**

   - Click on your project name (or create a new one if needed)

3. **Open Project Settings**

   - Click the ⚙️ gear icon (top left, next to "Project Overview")
   - Click "Project Settings"

4. **Go to Service Accounts Tab**

   - Click on the "Service Accounts" tab at the top of the settings page

5. **Generate Private Key**

   - Click the blue button "Generate new private key"
   - Click "Generate key" in the confirmation dialog
   - A JSON file will download automatically

6. **Save the File**
   - Move the downloaded file to: `backend/firebase-service-account.json`
   - The filename will be something like: `your-project-firebase-adminsdk-xxxxx-xxxxx.json`
   - Rename it to: `firebase-service-account.json` (optional, but cleaner)

---

## Step 2: Configure Environment (2 minutes)

### Quick Setup:

1. **Navigate to Backend Directory**

   ```bash
   cd /Users/brandoncheng/Documents/GitHub/Duke_AI_Hackathon/backend
   ```

2. **Create .env File**

   ```bash
   # Copy the example file
   cp .env.example .env

   # Or create a new one
   touch .env
   ```

3. **Add Firebase Configuration**

   Open `.env` in your editor and add this line:

   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```

   **Your `.env` file should look like:**

   ```env
   # Add your Firebase configuration here
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```

4. **Verify File Structure**

   Your backend directory should now have:

   ```
   backend/
   ├── .env                          ← Your new file
   ├── firebase-service-account.json ← The file you downloaded
   ├── main.py
   └── ...
   ```

---

## Verification

### Test Your Setup:

1. **Check Files Exist**

   ```bash
   cd backend
   ls -la firebase-service-account.json .env
   ```

   Both files should be listed.

2. **Test Environment Loading**

   ```bash
   source ../venv/bin/activate
   python -c "from dotenv import load_dotenv; import os; load_dotenv(); print('✅ Firebase path:', os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH'))"
   ```

   You should see: `✅ Firebase path: ./firebase-service-account.json`

3. **Start Server and Check Firebase Initialization**

   ```bash
   uvicorn main:app --reload
   ```

   Look for this message in the console:

   - ✅ `Firebase Admin SDK initialized with service account file` (SUCCESS!)
   - ⚠️ `Firebase Admin SDK not initialized` (check your .env file)

---

## Troubleshooting

### Problem: "File not found"

- **Fix**: Make sure `firebase-service-account.json` is in the `backend` directory
- **Check**: `ls backend/firebase-service-account.json` should show the file

### Problem: "Firebase not initialized"

- **Fix**: Check your `.env` file has the correct variable name
- **Check**: The path in `.env` matches where your JSON file is located

### Problem: "No such file or directory" for .env

- **Fix**: Make sure you created the `.env` file in the `backend` directory
- **Check**: `ls -la backend/.env` should show the file

---

## What's Next?

After completing Steps 1 & 2:

✅ **Step 3**: Test the integration (see main FIREBASE_SETUP.md)  
✅ **Step 4**: Set up Firebase in your React frontend  
✅ **Step 5**: Start using protected routes in your backend

---

## Security Reminder

⚠️ **Important**:

- The `.env` file is already in `.gitignore` (won't be committed)
- The `firebase-service-account.json` file is also in `.gitignore`
- Never share these files or commit them to Git
- If you accidentally commit them, regenerate the service account key immediately
