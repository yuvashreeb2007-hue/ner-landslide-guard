"""
NER LandslideGuard - FastAPI Application Entrypoint
AI-Based Early Warning & Landslide Risk Monitoring Platform for India's North Eastern Region
"""

import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from app.api.routes import router
from app.ml.predictor import predictor, MODEL_PATH

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[NER LandslideGuard Backend] Starting AI Early Warning Engine...")
    if not os.path.exists(MODEL_PATH):
        print("[NER LandslideGuard Backend] Model artifact not found. Initializing training pipeline...")
        from app.ml.train import train_and_evaluate_model
        train_and_evaluate_model()
        predictor._load_model()
    else:
        print(f"[NER LandslideGuard Backend] ML Model artifact found at: {MODEL_PATH}")
    yield
    print("[NER LandslideGuard Backend] Shutting down...")

app = FastAPI(
    title="NER LandslideGuard AI Engine",
    description="Operational AI-Based Landslide Risk Prediction & Disaster Early Warning Platform for Northeast India (Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Sikkim).",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include core REST API routes
app.include_router(router)

@app.get("/")
def root():
    return {
        "platform": "NER LandslideGuard",
        "description": "AI-Based Early Warning & Landslide Risk Monitoring System",
        "region": "North Eastern Region (NER), India",
        "docs": "/docs",
        "status": "OPERATIONAL"
    }
