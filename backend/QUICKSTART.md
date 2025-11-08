# 🚀 Quick Start Guide

## One-Command Setup

### macOS/Linux:
```bash
cd backend && chmod +x setup.sh && ./setup.sh && source .venv/bin/activate && python main.py
```

### Windows:
```bash
cd backend && setup.bat && .venv\Scripts\activate.bat && python main.py
```

## What This Does

1. ✅ Creates a Python virtual environment (`.venv/`)
2. ✅ Installs all required dependencies
3. ✅ Starts the FastAPI server on port 8000

## Verify It Works

Open your browser and go to:
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Words List**: http://localhost:8000/api/words

## Next Steps

- Test the sign scoring API using the interactive docs
- Check `SETUP_INSTRUCTIONS.md` for detailed setup
- Check `README.md` for API documentation

## Common Issues

**Port 8000 already in use?**
- Change port: `PORT=8001 python main.py`

**Import errors?**
- Make sure virtual environment is activated (you should see `(.venv)` in terminal)

**Python not found?**
- Use `python3` instead of `python` on macOS/Linux

