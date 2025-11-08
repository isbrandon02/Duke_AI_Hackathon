@echo off
REM Setup script for backend virtual environment (Windows)
REM Run this script to set up the development environment

echo 🚀 Setting up backend development environment...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

echo ✅ Found Python
python --version

REM Create virtual environment
if exist .venv (
    echo ⚠️  Virtual environment already exists. Removing old one...
    rmdir /s /q .venv
)

echo 📦 Creating virtual environment...
python -m venv .venv

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call .venv\Scripts\activate.bat

REM Upgrade pip
echo ⬆️  Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

echo.
echo ✅ Setup complete!
echo.
echo To activate the virtual environment, run:
echo   .venv\Scripts\activate.bat
echo.
echo To start the server, run:
echo   python main.py
echo   or
echo   uvicorn main:app --reload --host 0.0.0.0 --port 8000
echo.

pause

