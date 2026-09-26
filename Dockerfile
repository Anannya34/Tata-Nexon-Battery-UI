# Tata Nexon EV Battery UI & RUL Prediction System - Render Production Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency specifications first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy full application source
COPY . .

# Ensure data and models directories exist
RUN mkdir -p data/models data/exports logs

# Pre-train ensemble ML models during Docker build
RUN python train_models.py

# Expose default port
ENV PORT=8000
EXPOSE 8000

# Start FastAPI application using dynamic Render PORT variable
CMD ["sh", "-c", "uvicorn api:app --host 0.0.0.0 --port ${PORT:-8000}"]
