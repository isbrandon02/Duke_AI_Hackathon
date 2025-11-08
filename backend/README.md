# Backend (FastAPI) - Sign Language Learning API

## Quick Setup

### Option 1: Automated Setup (Recommended)

**macOS/Linux:**
```bash
cd backend
chmod +x setup.sh
./setup.sh
source .venv/bin/activate
python main.py
```

**Windows:**
```bash
cd backend
setup.bat
.venv\Scripts\activate.bat
python main.py
```

### Option 2: Manual Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python3 -m venv .venv
   # or on Windows: python -m venv .venv
   ```

3. Activate virtual environment:
   ```bash
   # macOS/Linux:
   source .venv/bin/activate
   
   # Windows:
   .venv\Scripts\activate.bat
   ```

4. Install dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. Start the server:
   ```bash
   python main.py
   # or
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at: `http://localhost:8000`

## API Documentation

Interactive API docs (Swagger UI): `http://localhost:8000/docs`

## API Endpoints

### Health & Testing
- `GET /` - Hello message
- `GET /health` - Health check: `{"message":"ok"}`
- `POST /echo` - Echo test: `{"text": "..."}`

### Sign Language Scoring
- `GET /api/words` - Get list of supported words
  - Returns: `[{"id": "hello", "display_name": "Hello", "difficulty": "easy"}, ...]`

- `POST /api/attempts` - Evaluate sign language attempt
  - Request body:
    ```json
    {
      "word": "hello",
      "frames": [
        {
          "landmarks": [
            {"x": 0.5, "y": 0.3, "z": 0.0, "v": 1.0},
            ... (21 landmarks total)
          ]
        }
      ]
    }
    ```
  - Response:
    ```json
    {
      "word": "hello",
      "score": 82.3,
      "passed": true,
      "tips": ["Almost there—slightly adjust finger positioning."]
    }
    ```

## Requirements

- Python 3.8 or higher
- All dependencies are listed in `requirements.txt`

## Notes

- The virtual environment (`.venv/`) is excluded from git via `.gitignore`
- Each team member should create their own virtual environment
- The server runs on port 8000 by default (configurable via PORT environment variable)
