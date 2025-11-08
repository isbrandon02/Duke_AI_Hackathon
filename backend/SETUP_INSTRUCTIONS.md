# Setup Instructions for Team Members

## Quick Start (5 minutes)

### For macOS/Linux Users:

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd Duke_AI_Hackathon
   ```

2. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

3. **Run the setup script**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

4. **Activate the virtual environment**:
   ```bash
   source .venv/bin/activate
   ```

5. **Start the server**:
   ```bash
   python main.py
   ```

6. **Test the API**:
   - Open browser: http://localhost:8000/docs
   - Or test with curl:
     ```bash
     curl http://localhost:8000/api/words
     ```

### For Windows Users:

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd Duke_AI_Hackathon
   ```

2. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

3. **Run the setup script**:
   ```bash
   setup.bat
   ```

4. **Activate the virtual environment**:
   ```bash
   .venv\Scripts\activate.bat
   ```

5. **Start the server**:
   ```bash
   python main.py
   ```

6. **Test the API**:
   - Open browser: http://localhost:8000/docs
   - Or test with PowerShell:
     ```powershell
     Invoke-WebRequest -Uri http://localhost:8000/api/words
     ```

## Troubleshooting

### Python version issues:
- Make sure you have Python 3.8 or higher
- Check version: `python3 --version` (macOS/Linux) or `python --version` (Windows)
- If you have multiple Python versions, use `python3` explicitly

### Virtual environment issues:
- If `.venv` already exists and causes problems, delete it and run setup again:
  ```bash
  rm -rf .venv  # macOS/Linux
  rmdir /s /q .venv  # Windows
  ```

### Port already in use:
- If port 8000 is taken, change it in `main.py` or use:
  ```bash
  PORT=8001 python main.py
  ```

### Import errors:
- Make sure you activated the virtual environment (you should see `(.venv)` in your terminal)
- Reinstall dependencies: `pip install -r requirements.txt`

### NumPy installation issues:
- If you're on Python 3.12+ and get NumPy build errors, the requirements.txt already uses a compatible version
- If issues persist, try: `pip install numpy --upgrade`

## Daily Workflow

### Starting work:
1. Navigate to backend: `cd backend`
2. Activate venv: `source .venv/bin/activate` (or `.venv\Scripts\activate.bat` on Windows)
3. Start server: `python main.py`

### Stopping work:
1. Stop server: `Ctrl+C`
2. Deactivate venv: `deactivate` (optional)

### Pulling updates:
1. Pull latest code: `git pull`
2. Activate venv: `source .venv/bin/activate`
3. Update dependencies (if requirements.txt changed): `pip install -r requirements.txt`
4. Start server: `python main.py`

## Need Help?

- Check the main README.md in the backend folder
- Check API documentation at http://localhost:8000/docs when server is running
- Ask your teammates!

