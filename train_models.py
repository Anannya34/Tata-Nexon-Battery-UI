"""
Comprehensive model training pipeline for Battery RUL Prediction System.
Trains LSTM, Transformer, and Ensemble models with hyperparameter optimization.
"""

import os
import time
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from loguru import logger
from config import settings
from data_processor import data_processor, load_sample_data
from models import ModelTrainer, EnsembleModel, model_manager, create_sequence_data


class ModelTrainingPipeline:
    """Complete model training pipeline with evaluation and saving."""
    
    def __init__(self):
        self.trainer = ModelTrainer()
        self.training_data = None
        self.metrics = {}
        
    def load_training_data(self) -> pd.DataFrame:
        """Load and prepare training data."""
        logger.info("Loading training data...")
        
        # Try to load real data first, fall back to sample data
        data_paths = [
            settings.data_dir / "Battery_Data_Cleaned.csv",
            settings.data_dir / "battery_data.csv",
            settings.data_dir / "training_data.csv"
        ]
        
        df = None
        for path in data_paths:
            if path.exists():
                try:
                    df = pd.read_csv(path)
                    logger.info(f"Loaded data from {path}: {len(df)} records")
                    break
                except Exception as e:
                    logger.warning(f"Failed to load {path}: {str(e)}")
        
        if df is None or df.empty:
            logger.info("No existing data found, generating sample data...")
            df = load_sample_data()
        
        if df.empty:
            raise ValueError("No training data available")
        
        self.training_data = df
        logger.info(f"Training data loaded: {len(df)} records, {len(df.columns)} features")
        
        return df
    
    def prepare_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Prepare and process data for training."""
        logger.info("Preparing training data...")
        
        # Process data using the data processor
        X, y_rul, y_sop = data_processor.process_data(df, is_training=True)
        
        # Save the fitted data processor
        processor_path = settings.models_dir / "data_processor.pkl"
        data_processor.save_processor(str(processor_path))
        
        logger.info(f"Data prepared: X shape {X.shape}, y_rul shape {y_rul.shape}, y_sop shape {y_sop.shape}")
        
        return X, y_rul, y_sop
    
    def train_ensemble_model(self, X: np.ndarray, y_rul: np.ndarray, y_sop: np.ndarray) -> Dict[str, float]:
        """Train ensemble model."""
        logger.info("Training ensemble model...")
        start_time = time.time()
        
        # Initialize and train ensemble
        ensemble = EnsembleModel()
        metrics = ensemble.train(X, y_rul, y_sop)
        
        # Save ensemble model
        ensemble_path = settings.models_dir / "ensemble_model.pkl"
        ensemble.save(str(ensemble_path))
        
        training_time = time.time() - start_time
        logger.info(f"Ensemble model training completed in {training_time:.2f} seconds")
        
        # Add training time to metrics
        metrics['training_time_seconds'] = training_time
        
        return metrics
    
    def train_deep_learning_models(self, X: np.ndarray, y_rul: np.ndarray, y_sop: np.ndarray) -> Dict[str, Dict[str, float]]:
        """Train LSTM and Transformer models."""
        logger.info("Training deep learning models...")
        
        # Create sequences for time-series models
        X_seq, y_rul_seq, y_sop_seq = create_sequence_data(X, y_rul, y_sop, settings.sequence_length)
        
        models_metrics = {}
        
        # Train LSTM
        try:
            logger.info("Training LSTM model...")
            start_time = time.time()
            
            lstm_model = self.trainer.train_lstm(X_seq, y_rul_seq, y_sop_seq)
            
            training_time = time.time() - start_time
            
            # Evaluate LSTM
            lstm_metrics = self.evaluate_deep_model(lstm_model, X_seq, y_rul_seq, y_sop_seq, "LSTM")
            lstm_metrics['training_time_seconds'] = training_time
            
            models_metrics['lstm'] = lstm_metrics
            
        except Exception as e:
            logger.error(f"LSTM training failed: {str(e)}")
            models_metrics['lstm'] = {'error': str(e)}
        
        # Train Transformer
        try:
            logger.info("Training Transformer model...")
            start_time = time.time()
            
            transformer_model = self.trainer.train_transformer(X_seq, y_rul_seq, y_sop_seq)
            
            training_time = time.time() - start_time
            
            # Evaluate Transformer
            transformer_metrics = self.evaluate_deep_model(transformer_model, X_seq, y_rul_seq, y_sop_seq, "Transformer")
            transformer_metrics['training_time_seconds'] = training_time
            
            models_metrics['transformer'] = transformer_metrics
            
        except Exception as e:
            logger.error(f"Transformer training failed: {str(e)}")
            models_metrics['transformer'] = {'error': str(e)}
        
        return models_metrics
    
    def evaluate_deep_model(self, model, X: np.ndarray, y_rul: np.ndarray, y_sop: np.ndarray, model_name: str) -> Dict[str, float]:
        """Evaluate deep learning model."""
        import torch
        
        # Split data for evaluation
        X_train, X_test, y_rul_train, y_rul_test, y_sop_train, y_sop_test = train_test_split(
            X, y_rul, y_sop, test_size=settings.validation_split, random_state=settings.random_seed
        )
        
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        model.eval()
        
        with torch.no_grad():
            X_test_tensor = torch.FloatTensor(X_test).to(device)
            rul_pred, sop_pred = model(X_test_tensor)
            
            rul_pred = rul_pred.cpu().numpy()
            sop_pred = sop_pred.cpu().numpy()
        
        # Calculate metrics
        rul_mae = mean_absolute_error(y_rul_test, rul_pred)
        rul_rmse = np.sqrt(mean_squared_error(y_rul_test, rul_pred))
        rul_r2 = r2_score(y_rul_test, rul_pred)
        
        sop_mae = mean_absolute_error(y_sop_test, sop_pred)
        sop_rmse = np.sqrt(mean_squared_error(y_sop_test, sop_pred))
        sop_r2 = r2_score(y_sop_test, sop_pred)
        
        metrics = {
            'rul_mae': rul_mae,
            'rul_rmse': rul_rmse,
            'rul_r2': rul_r2,
            'sop_mae': sop_mae,
            'sop_rmse': sop_rmse,
            'sop_r2': sop_r2,
            'dataset_size': len(X_test)
        }
        
        logger.info(f"{model_name} Evaluation - RUL MAE: {rul_mae:.3f}, SOP MAE: {sop_mae:.3f}")
        
        return metrics
    
    def save_training_report(self, all_metrics: Dict[str, Any]):
        """Save comprehensive training report."""
        report = {
            'training_timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'system_info': {
                'version': settings.version,
                'environment': settings.environment,
                'random_seed': settings.random_seed
            },
            'data_info': {
                'total_records': len(self.training_data) if self.training_data is not None else 0,
                'features_count': len(self.training_data.columns) if self.training_data is not None else 0,
                'data_source': 'sample_data' if self.training_data is not None and 'cycle' in self.training_data.columns else 'real_data'
            },
            'training_config': {
                'batch_size': settings.batch_size,
                'learning_rate': settings.learning_rate,
                'num_epochs': settings.num_epochs,
                'sequence_length': settings.sequence_length,
                'validation_split': settings.validation_split
            },
            'model_metrics': all_metrics,
            'best_models': self.identify_best_models(all_metrics)
        }
        
        # Save report
        report_path = settings.models_dir / "training_report.json"
        import json
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        logger.info(f"Training report saved to {report_path}")
        
        return report
    
    def identify_best_models(self, all_metrics: Dict[str, Any]) -> Dict[str, str]:
        """Identify best performing models."""
        best_models = {}
        
        # Find best model for RUL prediction
        rul_scores = {}
        for model_name, metrics in all_metrics.items():
            if isinstance(metrics, dict) and 'rul_mae' in metrics:
                rul_scores[model_name] = metrics['rul_mae']
        
        if rul_scores:
            best_rul_model = min(rul_scores, key=rul_scores.get)
            best_models['best_rul_model'] = best_rul_model
            best_models['best_rul_mae'] = rul_scores[best_rul_model]
        
        # Find best model for SOP prediction
        sop_scores = {}
        for model_name, metrics in all_metrics.items():
            if isinstance(metrics, dict) and 'sop_mae' in metrics:
                sop_scores[model_name] = metrics['sop_mae']
        
        if sop_scores:
            best_sop_model = min(sop_scores, key=sop_scores.get)
            best_models['best_sop_model'] = best_sop_model
            best_models['best_sop_mae'] = sop_scores[best_sop_model]
        
        # Overall best model (combined score)
        combined_scores = {}
        for model_name, metrics in all_metrics.items():
            if isinstance(metrics, dict) and 'rul_mae' in metrics and 'sop_mae' in metrics:
                # Normalize and combine scores (lower is better)
                rul_norm = metrics['rul_mae'] / 100  # Normalize RUL MAE
                sop_norm = metrics['sop_mae']        # SOP MAE is already 0-1
                combined_scores[model_name] = rul_norm + sop_norm
        
        if combined_scores:
            best_overall_model = min(combined_scores, key=combined_scores.get)
            best_models['best_overall_model'] = best_overall_model
            best_models['best_combined_score'] = combined_scores[best_overall_model]
        
        return best_models
    
    def run_training_pipeline(self, force_retrain: bool = False) -> Dict[str, Any]:
        """Run the complete training pipeline."""
        logger.info("=" * 60)
        logger.info(f"Starting {settings.app_name} Model Training Pipeline")
        logger.info("=" * 60)
        
        pipeline_start_time = time.time()
        
        try:
            # Check if models already exist
            if not force_retrain:
                ensemble_path = settings.models_dir / "ensemble_model.pkl"
                if ensemble_path.exists():
                    logger.info("Models already exist. Use --force-retrain to retrain.")
                    logger.info("Loading existing models...")
                    model_manager.load_models()
                    return {"status": "models_already_exist"}
            
            # Load and prepare data
            df = self.load_training_data()
            X, y_rul, y_sop = self.prepare_data(df)
            
            # Train models
            all_metrics = {}
            
            # 1. Train Ensemble Model (Traditional ML)
            logger.info("\n" + "=" * 40)
            logger.info("TRAINING ENSEMBLE MODEL")
            logger.info("=" * 40)
            
            ensemble_metrics = self.train_ensemble_model(X, y_rul, y_sop)
            all_metrics['ensemble'] = ensemble_metrics
            
            # 2. Train Deep Learning Models
            logger.info("\n" + "=" * 40)
            logger.info("TRAINING DEEP LEARNING MODELS")
            logger.info("=" * 40)
            
            dl_metrics = self.train_deep_learning_models(X, y_rul, y_sop)
            all_metrics.update(dl_metrics)
            
            # 3. Generate training report
            logger.info("\n" + "=" * 40)
            logger.info("GENERATING TRAINING REPORT")
            logger.info("=" * 40)
            
            report = self.save_training_report(all_metrics)
            
            # 4. Load trained models into model manager
            logger.info("\n" + "=" * 40)
            logger.info("LOADING TRAINED MODELS")
            logger.info("=" * 40)
            
            model_manager.load_models()
            
            # Pipeline summary
            pipeline_time = time.time() - pipeline_start_time
            
            logger.info("\n" + "=" * 60)
            logger.info("TRAINING PIPELINE COMPLETED SUCCESSFULLY")
            logger.info("=" * 60)
            logger.info(f"Total pipeline time: {pipeline_time:.2f} seconds")
            logger.info(f"Models trained: {list(all_metrics.keys())}")
            
            # Print best models
            best_models = report['best_models']
            if best_models:
                logger.info("\nBest Models:")
                for metric, model in best_models.items():
                    if not metric.endswith('_mae') and not metric.endswith('_score'):
                        logger.info(f"  {metric}: {model}")
            
            logger.info(f"\nTraining report saved to: {settings.models_dir / 'training_report.json'}")
            logger.info(f"Models saved to: {settings.models_dir}")
            logger.info("\nYou can now run the application:")
            logger.info("  python main.py run    # Start both API and dashboard")
            logger.info("  python main.py api    # Start API only")
            logger.info("  python main.py dashboard  # Start dashboard only")
            
            return {
                "status": "success",
                "pipeline_time": pipeline_time,
                "metrics": all_metrics,
                "best_models": best_models,
                "report_path": str(settings.models_dir / 'training_report.json')
            }
            
        except Exception as e:
            logger.error(f"Training pipeline failed: {str(e)}")
            raise


def main():
    """Main training script entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Train Battery RUL Prediction Models")
    parser.add_argument(
        '--force-retrain',
        action='store_true',
        help='Force retraining even if models exist'
    )
    
    args = parser.parse_args()
    
    try:
        trainer = ModelTrainingPipeline()
        result = trainer.run_training_pipeline(force_retrain=args.force_retrain)
        
        if result["status"] == "success":
            logger.info("✅ Training completed successfully!")
        elif result["status"] == "models_already_exist":
            logger.info("ℹ️ Models already exist - use --force-retrain to retrain")
        
    except Exception as e:
        logger.error(f"❌ Training failed: {str(e)}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())