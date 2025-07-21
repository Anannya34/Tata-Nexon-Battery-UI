"""
Centralized configuration for Battery RUL Prediction System.
"""

import os
from pathlib import Path
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings
from loguru import logger


class Settings(BaseSettings):
    """Application configuration with all settings."""
    
    # App Info
    app_name: str = "Battery RUL Prediction System"
    version: str = "2.0.0"
    environment: str = "production"
    debug: bool = False
    
    # Security
    secret_key: str = "your-super-secret-key-change-in-production-make-it-very-long-and-secure"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # API Settings
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    dashboard_port: int = 8501
    
    # Data Paths
    data_dir: Path = Path("data")
    models_dir: Path = Path("data/models")
    exports_dir: Path = Path("data/exports")
    logs_dir: Path = Path("logs")
    
    # ML Parameters
    batch_size: int = 32
    learning_rate: float = 0.001
    num_epochs: int = 100
    early_stopping_patience: int = 10
    validation_split: float = 0.2
    random_seed: int = 42
    
    # Model Architecture
    lstm_hidden_size: int = 128
    lstm_num_layers: int = 2
    lstm_dropout: float = 0.2
    transformer_d_model: int = 256
    transformer_nhead: int = 8
    transformer_num_layers: int = 6
    sequence_length: int = 50
    
    # Health Thresholds
    rul_critical_threshold: int = 150
    rul_warning_threshold: int = 400
    sop_critical_threshold: float = 0.7
    sop_warning_threshold: float = 0.8
    max_expected_rul: int = 1000
    
    # Required Data Columns
    required_columns: List[str] = [
        "type", "ambient_temperature", "battery_id", "test_id", 
        "Capacity", "Re", "Rct"
    ]
    
    # Logging
    log_level: str = "INFO"
    log_rotation: str = "100 MB"
    log_retention: str = "30 days"
    
    # Cache Settings
    enable_cache: bool = True
    cache_ttl: int = 3600
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    def create_directories(self) -> None:
        """Create necessary directories."""
        directories = [
            self.data_dir,
            self.models_dir,
            self.exports_dir,
            self.logs_dir
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            
        logger.info(f"Created directories for {self.app_name}")


# Global settings instance
settings = Settings()
settings.create_directories()


def setup_logging():
    """Setup professional logging configuration."""
    # Remove default handler
    logger.remove()
    
    # Console logging with colors
    logger.add(
        lambda msg: print(msg, end=""),
        level=settings.log_level,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
               "<level>{level: <8}</level> | "
               "<cyan>{name}</cyan>:<cyan>{function}</cyan> | "
               "<level>{message}</level>",
        colorize=True
    )
    
    # File logging
    logger.add(
        settings.logs_dir / "app.log",
        level=settings.log_level,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}",
        rotation=settings.log_rotation,
        retention=settings.log_retention,
        compression="zip"
    )
    
    # Error file
    logger.add(
        settings.logs_dir / "error.log",
        level="ERROR",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}",
        rotation="50 MB",
        retention="7 days"
    )
    
    logger.info(f"Logging initialized for {settings.app_name} v{settings.version}")


# Initialize logging
setup_logging()