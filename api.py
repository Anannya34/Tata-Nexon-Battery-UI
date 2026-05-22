"""
Professional FastAPI web service for Battery RUL Prediction System.
Provides REST API endpoints with authentication, validation, and comprehensive documentation.
"""

import os
import time
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union

import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field, validator
from jose import jwt
from passlib.context import CryptContext
from loguru import logger

from config import settings
from predictor import prediction_engine, get_model_info, create_sample_prediction
from data_processor import validate_prediction_input, load_sample_data

# Security setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# FastAPI app initialization
app = FastAPI(
    title=settings.app_name,
    description="Professional Battery RUL Prediction System with Advanced ML and Real-time Analytics",
    version=settings.version,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])


# Pydantic Models
class BatteryInput(BaseModel):
    """Input model for battery measurements."""
    
    type: int = Field(..., description="Operation type (-1, 0, 1)", ge=-1, le=1)
    ambient_temperature: float = Field(..., description="Ambient temperature in Celsius", ge=-50, le=100)
    battery_id: Union[int, str] = Field(..., description="Unique battery identifier")
    test_id: Union[int, str] = Field(..., description="Test identifier")
    Capacity: float = Field(..., description="Battery capacity in Ah", gt=0)
    Re: float = Field(..., description="Electrolyte resistance in Ohm", gt=0)
    Rct: float = Field(..., description="Charge transfer resistance in Ohm", gt=0)
    
    @validator('type')
    def validate_type(cls, v):
        if v not in [-1, 0, 1]:
            raise ValueError('Type must be -1, 0, or 1')
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "type": 0,
                "ambient_temperature": 25.0,
                "battery_id": "BAT123",
                "test_id": "TEST456",
                "Capacity": 100.0,
                "Re": 0.1,
                "Rct": 0.2
            }
        }