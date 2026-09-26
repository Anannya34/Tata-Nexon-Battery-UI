# Tata Nexon EV Battery UI & RUL Prediction System ⚡🔋

[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19.0+-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF.svg)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An end-to-end **Electric Vehicle (EV) Battery Health Monitoring, 3D Pack Digital Twin & Remaining Useful Life (RUL) Prediction System** engineered specifically for the **Tata Nexon EV Ziptron 30.2 kWh / 320V Battery Pack Architecture**.

---

## 🌟 Key Highlights & System Architecture

1. **Tata Nexon EV Ziptron Pack Visualizer**:
   - 8 Modules • 96 Li-ion Cells interactive digital twin dashboard.
   - Real-time diagnostic gauges: SOH Pack (94.6%), Model Sync (97.4%), Risk Profile (12.0%).
   - Individual cell telemetry inspection (`M2-C11` temperature, SOC, voltage, SOH %, impedance $R_e, R_{ct}$).

2. **Indian EV & Battery Manufacturer Presets**:
   - Preset selector for **Tata Motors Ziptron (Nexon EV / Tiago EV)**, **Amaron EV Power**, **Ola Electric S1 Pro**, **Ather Energy 450X**, **Exide Energy Technologies**, **Hero Electric / Log9**, and **TVS iQube**.

3. **Step-by-Step Predictive ML Engine**:
   - Ensemble Machine Learning combining **Random Forest + LightGBM + XGBoost** trained on NASA Prognostics Center of Excellence (PCoE) battery aging degradation data mapped to the Tata Nexon pack architecture with zero data leakage.

4. **Official Faculty Defense Health Certificate**:
   - Exportable, printable **Tata Nexon EV Battery Health Certificate** with student and faculty signature blocks for project presentation.

5. **Animated Bootup Splash Screen**:
   - BI-OS diagnostic boot sequence with pulse progress indicators and direct cockpit launcher.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Installation & Environment Setup
```bash
# Clone the repository
git clone https://github.com/Anannya34/Tata-Nexon-Battery-UI.git
cd Tata-Nexon-Battery-UI

# Install Python dependencies
pip install -r requirements.txt

# Install React Frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Train Machine Learning Models
```bash
python train_models.py
```

### 3. Launch Backend API Server (Port 8000)
```bash
python main.py api
```

### 4. Launch React Cybernetic Dashboard (Port 3000)
```bash
python main.py dashboard
# OR
cd frontend && npm run dev
```

---

## 📊 Model Evaluation Metrics

| Target | Model Architecture | $R^2$ Score | MAE | RMSE |
|---|---|---|---|---|
| **State of Health (SOH %)** | Ensemble Regressor (RF + LightGBM + XGBoost) | **0.8051** | **3.49%** | **4.35%** |
| **Remaining Useful Life (RUL)** | Ensemble Regressor | **0.6778** | **11.86 cycles** | **16.14 cycles** |

---

## 📜 License & Citation

Distributed under the MIT License. Developed for Minor Project Defense & EV Prognostics Intelligence.