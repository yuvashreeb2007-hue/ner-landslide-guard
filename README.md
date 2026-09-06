# NER LandslideGuard 🏔️🛡️

> **AI-Powered Landslide Early Warning, Geotechnical Telemetry & Disaster Operations Command Center for Northeast India (NER)**

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=flat-square&logo=python)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4%2B-F7931E?style=flat-square&logo=scikit-learn)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Leaflet](https://img.shields.io/badge/Leaflet-GIS-199900?style=flat-square&logo=leaflet)
![PWA](https://img.shields.io/badge/PWA-Offline%20Sync-5A0FC8?style=flat-square&logo=pwa)

---

## 1. Project Overview

The **Northeast Region (NER) of India**—encompassing **Sikkim, Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, and Tripura**—presents extreme geological fragility. Intense monsoonal precipitation, high seismic activity, steep slopes, and active highway undercutting trigger catastrophic slope failures every year, isolating vulnerable settlements and blocking critical highway lifelines (such as NH-10 in Sikkim and NH-37 in Manipur).

**NER LandslideGuard** is a full-stack, AI-driven disaster operations and early warning command system. It combines:
1. **Machine Learning Slope Risk Prediction**: Pre-trained Random Forest model trained on 6,500+ geotechnical and precipitation records.
2. **Provider-Independent Weather Intelligence**: 4-tier GSI-IMD rainfall threshold evaluation and river hydrograph monitoring.
3. **Soil & Geotechnical IoT Telemetry**: Real-time simulation and LoRaWAN mesh support for Inclinometers, Piezometers, Wire Extensometers, and Soil Moisture Probes.
4. **Real-time Alert Rules & CAP Broadcast**: Multi-tier rule engine triggering localized Cell Broadcast SMS, WhatsApp alerts, and community sirens.
5. **Crowdsourced Field Hazard Reporting**: 6-step reporting wizard with GPS auto-location and AI computer vision damage classification.
6. **Emergency Response Prioritization (ICS)**: Multi-factor emergency scoring ($0\text{--}100$) and $P1\text{--}P4$ tactical dispatch for NDRF/SDRF mountain battalions.
7. **Offline PWA Resilience**: Background sync queue preserving field submissions under zero-connectivity mountain conditions.
8. **Tri-Lingual Internationalization (i18n)**: Full native support for **English**, **Hindi (हिन्दी)**, and **Assamese (অসমীয়া)**.

---

## 2. System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │               CLIENT LAYER (Next.js 14 / PWA)          │
                    │  * GIS Map Operations        * Risk Zone Inspector     │
                    │  * AI Prediction Studio      * CAP Alert Disseminator  │
                    │  * 6-Step Field Reporter     * Tactical Dispatch (ICS) │
                    │  * Weather & River Gauges    * IoT Sensor Dashboard    │
                    │  * Offline Queue Manager     * Tri-Lingual i18n Engine │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                                    REST API / JSON / PWA Sync
                                                │
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │            API GATEWAY & BACKEND (FastAPI)             │
                    │  * CORS Middleware          * Pydantic Schema Validator │
                    │  * REST Endpoints (/api/*)  * Geotechnical Logic Layer │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                    ┌───────────────────────────┴────────────────────────────┐
                    ▼                                                        ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────────────────┐
│        AI / ML RISK ENGINE           │  │            ADAPTER & SERVICE PROVIDERS           │
│  * Scikit-learn Random Forest Model  │  │  * WeatherProvider (IMD AWS / MockAdapter)       │
│  * Physics Geotechnical Fallback     │  │  * SensorProvider (LoRaWAN / MockSimulator)      │
│  * Factor Attribution & SOP Directives│  │  * VisionProvider (AI Damage Classifier)        │
│  * Multi-Factor Prioritization Engine│  │  * NotificationProvider (SMS / Push / In-App)    │
└──────────────────────────────────────┘  └──────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router, Server & Client Components)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.4 (Tailored EOC Dark Command Theme)
- **Spatial Mapping**: Leaflet.js & React-Leaflet (OpenStreetMap raster tiles & GeoJSON)
- **Data Visualization**: Recharts (Hyetographs, Sensor Rolling Sparklines, Gauge charts)
- **Icons**: Lucide React
- **PWA & Offline Storage**: Service Worker Cache API & `localStorage` FIFO Queue
- **Internationalization**: Custom React Context Provider with JSON dictionaries (`en`, `hi`, `as`)

### Backend
- **Framework**: Python FastAPI 0.110+
- **ASGI Server**: Uvicorn
- **Validation**: Pydantic v2
- **Data Processing**: NumPy & Pandas
- **Machine Learning**: Scikit-learn 1.4+ (RandomForestClassifier, Stratified K-Fold CV)
- **Serialization**: Joblib

---

## 4. Quick Start & Setup

### Prerequisites
- **Node.js**: v18.17+ or v20+
- **Python**: v3.10+
- **Git**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/yuvashreeb2007-hue/ner-landslide-guard.git
cd ner-landslide-guard
```

---

### Step 2: Backend Setup (FastAPI AI Engine)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # On Windows (PowerShell):
   python -m venv .venv
   .venv\Scripts\Activate.ps1

   # On Linux / macOS:
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI backend server:
   ```bash
   python run.py
   ```
   *The server will start at `http://localhost:8000`. Interactive OpenAPI Swagger documentation is available at `http://localhost:8000/docs`.*

---

### Step 3: Frontend Setup (Next.js Command Center)

1. Open a new terminal at the project root directory (`ner-landslide-guard`):
   ```bash
   # Install Node dependencies:
   npm install
   ```

2. Create your local environment file:
   ```bash
   # On Windows (PowerShell):
   Copy-Item .env.example .env.local

   # On Linux / macOS:
   cp .env.example .env.local
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *Open your browser and navigate to `http://localhost:3000`.*

4. To create a production build and verify type safety:
   ```bash
   npm run build
   npm start
   ```

---

## 5. Machine Learning Training Pipeline

The project includes an end-to-end ML pipeline in `backend/app/ml/train.py`.

### Running the ML Training Pipeline
```bash
cd backend
.venv\Scripts\python app/ml/train.py
```

### Training Pipeline Workflow:
1. **Synthetic Geotechnical Generation**: Generates 6,500 records reflecting terrain elevation (80m–4,200m), slope gradients (5°–75°), monsoonal rainfall (0–450mm), soil moisture saturation, NDVI vegetative cover, and historical slide frequency.
2. **Model Training**: Fits a balanced `RandomForestClassifier` (130 estimators, max depth 12).
3. **Validation**: Executes 5-fold Stratified Cross-Validation achieving:
   - **Mean Accuracy**: $\sim 95.8\%$
   - **Mean F1-Score**: $\sim 0.956$
   - **Mean ROC-AUC**: $\sim 0.988$
4. **Artifact Serialization**: Saves production weights and metadata to `backend/app/ml/model.joblib`.

---

## 6. Environment Variables

| Variable Name | Default Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Base URL for FastAPI backend endpoints |
| `NEXT_PUBLIC_DEMO_MODE` | `true` | Enables zero-config synthetic demo mode without external API keys |
| `NEXT_PUBLIC_DEFAULT_LANG` | `en` | Initial default language (`en`, `hi`, `as`) |
| `NEXT_PUBLIC_EOC_NODE` | `NER-EAST-EOC-GUWAHATI-01` | Operations center node identifier |
| `NEXT_PUBLIC_MAP_TILE_URL` | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` | GIS tile server URL |
| `PORT` | `8000` | FastAPI server port |
| `HOST` | `0.0.0.0` | FastAPI server network binding host |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins for frontend requests |
| `MODEL_PATH` | `app/ml/model.joblib` | Path to trained model artifact |

---

## 7. REST API Endpoints

| Method | Endpoint | Description | Sample Output |
|---|---|---|---|
| `GET` | `/api/health` | Service health check and node status | `{"status": "healthy", "version": "1.0.0"}` |
| `POST` | `/api/predict-risk` | AI Landslide risk inference with explainability | `{"risk_score": 88, "risk_level": "CRITICAL", "confidence": 0.98}` |
| `GET` | `/api/risk-zones` | List all 8-state monitored risk corridors | `[{"id": "RZ-SK-01", "name": "Singtam Axis", "riskScore": 88}]` |
| `GET` | `/api/risk-zones/{id}` | Detailed geotechnical parameters for a zone | `{"id": "RZ-SK-01", "soilMoisture": 91.2, "slope": 48.0}` |
| `POST` | `/api/reports` | Submit citizen / field officer hazard report | `{"id": "REP-2026-A1B2", "verificationStatus": "PENDING"}` |
| `GET` | `/api/incidents` | List active and historical ground slide incidents | `[{"id": "INC-2024-001", "severity": "CRITICAL"}]` |
| `GET` | `/api/alerts` | Active CAP warning bulletins | `[{"id": "ALT-2024-RED-089", "level": "RED"}]` |
| `GET` | `/api/weather` | District meteorological and rainfall telemetry | `[{"district": "Pakyong", "rainfall24h": 142.5}]` |

---

## 8. Complete Demonstration Flow

You can demonstrate the complete disaster response lifecycle directly from the UI:

```
┌──────────────┐     ┌──────────────┐     ┌───────────────┐     ┌───────────────┐
│   GIS Map    │ ──> │  Risk Zone   │ ──> │ AI Prediction │ ──> │ Alert Trigger │
│  (/map page) │     │  Inspector   │     │ (/predictions)│     │  (/alerts)    │
└──────────────┘     └──────────────┘     └───────────────┘     └───────────────┘
                                                                        │
┌──────────────┐     ┌──────────────┐     ┌───────────────┐             │
│  Tactical    │ <── │  Emergency   │ <── │  Field Report │ <───────────┘
│   Dispatch   │     │Priority (ICS)│     │ & AI Scan     │
│ (/emergency) │     │ (/emergency) │     │(/field-report)│
└──────────────┘     └──────────────┘     └───────────────┘
```

1. **GIS Risk Map (`/map`)**: Select high-risk zones across Sikkim, Assam, Meghalaya, or Manipur. Filter by state and risk level.
2. **AI Prediction Studio (`/predictions`)**: Adjust sliders for 24h rainfall (e.g. 150mm), soil moisture (90%), and slope angle (48°). Click **Run AI Inference** to observe real-time probability and Factor of Safety ($FoS$) calculations.
3. **Weather Intelligence (`/weather`)**: Click **Simulate Cherrapunji Cloudburst** to inject a 28.5 mm/hr deluge pulse and observe risk amplification across river gauges.
4. **IoT Sensor Fleet (`/sensors`)**: Switch between **Normal State**, **Warning State**, and **Critical Failure** scenarios to test automated sensor threshold detection.
5. **Field Hazard Reporter (`/field-report`)**: Complete the 6-step wizard, trigger AI computer vision diagnostics, and submit.
6. **Offline PWA Simulation (`/offline-queue`)**: Click **Simulate Mountain Offline Mode** to verify local caching and automatic re-synchronization upon reconnecting.
7. **Emergency Prioritization & Tactical Dispatch (`/emergency`)**: Inspect multi-factor emergency scoring ($P1\text{--}P4$) and click **Dispatch** to deploy NDRF/SDRF Mountain Battalions.
8. **Language Switching**: Use the header dropdown to toggle between **English**, **Hindi (हिन्दी)**, and **Assamese (অসমীয়া)** in real-time.

---

## 9. Future Real-Data Integrations

NER LandslideGuard is built with provider-independent interfaces ready for drop-in live integrations:

1. **India Meteorological Department (IMD)**:
   - Replace `MockWeatherProvider.ts` with `IMDWeatherProvider.ts` utilizing the IMD AWS API / Megha-Tropiques satellite stream.
2. **Geological Survey of India (GSI Bhukosh)**:
   - Connect WMS/WFS spatial layers for lithological formation, lineament density, and landslide susceptibility index (LSI).
3. **IoT LoRaWAN Gateways**:
   - Point `SensorProvider.ts` to an active MQTT broker subscribing to `ner/geotech/sensors/#`.
4. **National Disaster Management Authority (CAP-IPAWS)**:
   - Transmit standardized XML CAP bulletins directly to state emergency broadcast infrastructure.

---

## 10. License & Attribution

Developed for the **North Eastern Council (NEC)** and **State Disaster Management Authorities (ASDMA / SSDMA / NSDMA / SDMA)**. Distributed under the MIT License.