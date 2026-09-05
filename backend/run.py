"""
Uvicorn Server Launcher for NER LandslideGuard Backend
Runs FastAPI server on port 8000.
"""

import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import uvicorn
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

if __name__ == "__main__":
    print("=" * 65)
    print("Starting NER LandslideGuard AI Engine on http://localhost:8000")
    print("Interactive Swagger Docs available at http://localhost:8000/docs")
    print("=" * 65)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
