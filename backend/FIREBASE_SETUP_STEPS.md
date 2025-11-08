# Detailed Firebase Setup Steps 1 & 2

## Step 1: Get Firebase Service Account Credentials

### What is a Service Account?

A service account is a special type of Google account that represents your application (not a user). It allows your backend server to securely authenticate with Firebase and verify ID tokens from your users.

### Detailed Instructions:

#### 1.1. Go to Firebase Console

- Open your web browser and go to: https://console.firebase.google.com/
- Sign in with your Google account if you haven't already

#### 1.2. Select or Create a Project

- If you already have a Firebase project:
  - Click on your project name from the project list
- If you need to create a new project:
  - Click "Add project" or "Create a project"
  - Enter a project name (e.g., "Duke AI Hackathon")
  - Follow the setup wizard
  - Wait for the project to be created

#### 1.3. Navigate to Service Accounts

- In your Firebase project, look for the gear icon (⚙️) in the left sidebar
- Click on **Project Settings** (the gear icon next to "Project Overview")
- In the settings page, click on the **Service Accounts** tab (it's near the top of the page)

#### 1.4. Generate Service Account Key

- You'll see a section titled "Service Accounts" with options for Node.js, Python, and Java
- Click the button that says **"Generate new private key"** (it's usually a blue button)
- A warning dialog will appear saying "Are you sure you want to generate a new private key?"
  - This is normal - click **"Generate key"**
- A JSON file will automatically download to your computer
  - The filename will look something like: `your-project-name-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`

#### 1.5. Save the File Securely

- **Important**: This file contains sensitive credentials - treat it like a password!
- Move the downloaded JSON file to your project directory
- Recommended location: `backend/firebase-service-account.json`
- **DO NOT** commit this file to Git (it's already in `.gitignore`)

### What's Inside the JSON File?

The file contains something like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

## Step 2: Configure Backend Environment

### What is a .env file?

A `.env` file stores environment variables (configuration values) that your application needs. It keeps sensitive information like API keys separate from your code.

### Detailed Instructions:

#### 2.1. Create .env File in Backend Directory

- Navigate to your backend directory:

  ```bash
  cd /Users/brandoncheng/Documents/GitHub/Duke_AI_Hackathon/backend
  ```

- Check if a `.env` file already exists:
  ```bash
  ls -la | grep .env
  ```
  - If you see `.env`, it exists (but it's hidden because it starts with a dot)
  - If you don't see it, we'll create one

#### 2.2. Choose Your Configuration Method

You have **two options**. Choose the one that works best for you:

---

### **Option A: Service Account File Path (Recommended for Development)**

**Best for**: Local development, easier to manage

#### Steps:

1. Make sure your `firebase-service-account.json` file is in the `backend` directory

   - Full path should be: `/Users/brandoncheng/Documents/GitHub/Duke_AI_Hackathon/backend/firebase-service-account.json`

2. Create or edit the `.env` file:

   ```bash
   # If file doesn't exist, create it:
   touch .env

   # Or open it in your editor:
   code .env
   # or
   nano .env
   ```

3. Add this line to the `.env` file:

   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```

   **Or use absolute path:**

   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=/Users/brandoncheng/Documents/GitHub/Duke_AI_Hackathon/backend/firebase-service-account.json
   ```

4. Save the file

#### Example .env file:

```env
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Other environment variables (if you have any)
PORT=8000
```

---

### **Option B: Service Account JSON as Environment Variable (Recommended for Deployment)**

**Best for**: Production deployments, Docker containers, cloud platforms

#### Steps:

1. Open your `firebase-service-account.json` file in a text editor
2. Copy the **entire contents** of the JSON file (all of it, from `{` to `}`)
3. Create or edit the `.env` file in the backend directory
4. Add the JSON content as a single line (or use proper escaping):

   **Single line format:**

   ```env
   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project-id","private_key_id":"xxxxx","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com","client_id":"xxxxx","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/..."}'
   ```

   **Multi-line format (easier to read):**

   ```env
   FIREBASE_SERVICE_ACCOUNT_JSON='{
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "xxxxx",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
     "client_id": "xxxxx",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
   }'
   ```

5. **Important**: Make sure the entire JSON is on one line or properly escaped if using multi-line
6. Save the file

---

### **2.3. Verify Your Configuration**

1. Make sure your `.env` file is in the `backend` directory
2. Check that the file is not tracked by Git (it should be in `.gitignore`):

   ```bash
   git status
   ```

   - If `.env` shows up as untracked, that's good!
   - If it shows as tracked, add it to `.gitignore`

3. Test that the environment variable is loaded:
   ```bash
   cd backend
   source ../venv/bin/activate
   python -c "from dotenv import load_dotenv; import os; load_dotenv(); print('Path:', os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')); print('JSON set:', 'Yes' if os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON') else 'No')"
   ```

---

### **Which Option Should You Choose?**

- **Use Option A** if:

  - You're developing locally
  - You want an easier setup
  - You don't mind having the JSON file in your project directory

- **Use Option B** if:
  - You're deploying to production
  - You're using Docker containers
  - You're deploying to cloud platforms (Heroku, Railway, AWS, etc.)
  - You want to avoid having the file in your file system

---

### **Common Issues & Solutions**

#### Issue: "File not found" error

- **Solution**: Check that the path in `.env` is correct
- Use absolute path if relative path doesn't work
- Make sure the file actually exists at that location

#### Issue: "Invalid JSON" error

- **Solution**: If using Option B, make sure the JSON is properly formatted
- Check that all quotes are escaped correctly
- Try using single quotes around the entire JSON string

#### Issue: Environment variable not loading

- **Solution**: Make sure you're calling `load_dotenv()` in your Python code (already done in `main.py`)
- Check that the `.env` file is in the correct directory
- Verify the variable name matches exactly (case-sensitive)

#### Issue: "Firebase not initialized" warning

- **Solution**:
  1. Double-check your `.env` file has the correct variable name
  2. Verify the file path is correct (Option A) or JSON is valid (Option B)
  3. Make sure the service account file has the correct permissions (readable)

---

## Next Steps

After completing Steps 1 and 2:

1. **Test the setup**: Start your backend server and check for the Firebase initialization message
2. **Set up frontend**: Configure Firebase in your React app
3. **Test authentication**: Try signing in and sending tokens to your backend

See `FIREBASE_SETUP.md` for the complete setup guide.
