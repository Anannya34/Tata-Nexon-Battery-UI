"""
Main application runner for Battery RUL Prediction System.
Provides unified entry point for all system components.
"""

import sys
import subprocess
import argparse
import multiprocessing
import time
from pathlib import Path
from typing import Optional

from loguru import logger
from config import settings


class ApplicationRunner:
    """Main application runner with support for different modes."""
    
    def __init__(self):
        self.base_dir = Path(__file__).parent
        
    def run_api_server(self, host: str = None, port: int = None, workers: int = None):
        """Run the FastAPI server."""
        import uvicorn
        from api import app
        
        host = host or settings.api_host
        port = port or settings.api_port
        workers = workers or (1 if settings.debug else settings.api_workers)
        
        logger.info(f"Starting API server on {host}:{port} with {workers} worker(s)")
        
        uvicorn.run(
            "api:app",
            host=host,
            port=port,
            workers=workers,
            reload=settings.debug,
            log_level=settings.log_level.lower()
        )
    
    def run_dashboard(self, port: int = None):
        """Run the Streamlit dashboard."""
        port = port or settings.dashboard_port
        
        logger.info(f"Starting Streamlit dashboard on port {port}")
        
        # Run streamlit
        cmd = [
            sys.executable, "-m", "streamlit", "run",
            str(self.base_dir / "dashboard.py"),
            "--server.port", str(port),
            "--server.address", "0.0.0.0",
            "--theme.base", "light",
            "--theme.primaryColor", "#1f77b4"
        ]
        
        subprocess.run(cmd)
    
    def run_both_services(self, api_port: int = None, dashboard_port: int = None):
        """Run both API and dashboard simultaneously."""
        api_port = api_port or settings.api_port
        dashboard_port = dashboard_port or settings.dashboard_port
        
        logger.info("Starting both API server and dashboard...")
        
        # Start API server in a separate process
        api_process = multiprocessing.Process(
            target=self.run_api_server,
            args=(settings.api_host, api_port, 1)
        )
        api_process.start()
        
        # Wait a moment for API to start
        time.sleep(2)
        
        # Start dashboard (this will block)
        try:
            self.run_dashboard(dashboard_port)
        except KeyboardInterrupt:
            logger.info("Shutting down services...")
        finally:
            api_process.terminate()
            api_process.join()
    
    def train_models(self, force_retrain: bool = False):
        """Train or retrain all models."""
        logger.info("Starting model training...")
        
        try:
            from train_models import ModelTrainingPipeline
            
            trainer = ModelTrainingPipeline()
            trainer.run_training_pipeline(force_retrain=force_retrain)
            
            logger.info("Model training completed successfully")
            
        except Exception as e:
            logger.error(f"Model training failed: {str(e)}")
            sys.exit(1)
    
    def check_system(self):
        """Check system status and dependencies."""
        logger.info("Checking system status...")
        
        issues = []
        
        # Check directories
        required_dirs = [
            settings.data_dir,
            settings.models_dir,
            settings.exports_dir,
            settings.logs_dir
        ]
        
        for directory in required_dirs:
            if not directory.exists():
                issues.append(f"Missing directory: {directory}")
            else:
                logger.info(f"✅ Directory exists: {directory}")
        
        # Check models
        try:
            from models import model_manager
            model_manager.load_models()
            model_info = model_manager.get_model_info()
            
            if model_info['model_count'] > 0:
                logger.info(f"✅ Models loaded: {model_info['available_models']}")
            else:
                issues.append("No trained models found")
                
        except Exception as e:
            issues.append(f"Model loading failed: {str(e)}")
        
        # Check data processor
        try:
            from data_processor import data_processor
            logger.info("✅ Data processor initialized")
        except Exception as e:
            issues.append(f"Data processor initialization failed: {str(e)}")
        
        # Check prediction engine
        try:
            from predictor import prediction_engine
            logger.info("✅ Prediction engine initialized")
        except Exception as e:
            issues.append(f"Prediction engine initialization failed: {str(e)}")
        
        # Summary
        if issues:
            logger.error("System check found issues:")
            for issue in issues:
                logger.error(f"  ❌ {issue}")
            
            logger.info("\nTo fix issues, try:")
            logger.info("  1. python main.py train  # Train models")
            logger.info("  2. Check file permissions")
            logger.info("  3. Install missing dependencies")
            
            return False
        else:
            logger.info("✅ System check passed - all components ready")
            return True
    
    def run_tests(self):
        """Run system tests."""
        logger.info("Running system tests...")
        
        try:
            # Test sample prediction
            from predictor import create_sample_prediction
            result = create_sample_prediction()
            
            if 'error' in result:
                logger.error(f"Sample prediction failed: {result['error']}")
                return False
            else:
                logger.info("✅ Sample prediction test passed")
            
            # Test data processing
            from data_processor import load_sample_data, data_processor
            
            sample_data = load_sample_data()
            if sample_data.empty:
                logger.error("Sample data loading failed")
                return False
            else:
                logger.info("✅ Sample data test passed")
            
            logger.info("✅ All tests passed")
            return True
            
        except Exception as e:
            logger.error(f"Tests failed: {str(e)}")
            return False
    
    def generate_sample_data(self, n_samples: int = 1000):
        """Generate sample data for testing."""
        logger.info(f"Generating {n_samples} sample records...")
        
        try:
            from data_processor import load_sample_data
            
            # This will generate sample data if it doesn't exist
            sample_data = load_sample_data()
            logger.info(f"✅ Generated {len(sample_data)} sample records")
            
        except Exception as e:
            logger.error(f"Sample data generation failed: {str(e)}")
            sys.exit(1)
    
    def show_status(self):
        """Show detailed system status."""
        print(f"\n{settings.app_name} v{settings.version}")
        print("=" * 50)
        
        # System info
        print(f"Environment: {settings.environment}")
        print(f"Debug mode: {settings.debug}")
        print(f"API port: {settings.api_port}")
        print(f"Dashboard port: {settings.dashboard_port}")
        print()
        
        # Directories
        print("Directories:")
        print(f"  Data: {settings.data_dir}")
        print(f"  Models: {settings.models_dir}")
        print(f"  Exports: {settings.exports_dir}")
        print(f"  Logs: {settings.logs_dir}")
        print()
        
        # Models
        try:
            from models import model_manager
            model_manager.load_models()
            model_info = model_manager.get_model_info()
            
            print("Models:")
            print(f"  Available: {model_info.get('available_models', [])}")
            print(f"  Best model: {model_info.get('best_model', 'None')}")
            print(f"  Count: {model_info.get('model_count', 0)}")
        except Exception as e:
            print(f"  Error loading models: {str(e)}")
        
        print()


def main():
    """Main entry point with command line interface."""
    parser = argparse.ArgumentParser(
        description=f"{settings.app_name} v{settings.version}",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py api                    # Run API server only
  python main.py dashboard              # Run dashboard only
  python main.py run                    # Run both services
  python main.py train                  # Train models
  python main.py check                  # Check system status
  python main.py test                   # Run tests
        """
    )
    
    parser.add_argument(
        'command',
        choices=['api', 'dashboard', 'run', 'train', 'check', 'test', 'generate-data', 'status'],
        help='Command to execute'
    )
    
    parser.add_argument(
        '--api-port',
        type=int,
        default=settings.api_port,
        help=f'API server port (default: {settings.api_port})'
    )
    
    parser.add_argument(
        '--dashboard-port',
        type=int,
        default=settings.dashboard_port,
        help=f'Dashboard port (default: {settings.dashboard_port})'
    )
    
    parser.add_argument(
        '--host',
        default=settings.api_host,
        help=f'API server host (default: {settings.api_host})'
    )
    
    parser.add_argument(
        '--workers',
        type=int,
        default=settings.api_workers,
        help=f'Number of API workers (default: {settings.api_workers})'
    )
    
    parser.add_argument(
        '--force-retrain',
        action='store_true',
        help='Force model retraining even if models exist'
    )
    
    parser.add_argument(
        '--samples',
        type=int,
        default=1000,
        help='Number of sample records to generate (default: 1000)'
    )
    
    args = parser.parse_args()
    
    # Initialize runner
    runner = ApplicationRunner()
    
    # Execute command
    try:
        if args.command == 'api':
            runner.run_api_server(args.host, args.api_port, args.workers)
            
        elif args.command == 'dashboard':
            runner.run_dashboard(args.dashboard_port)
            
        elif args.command == 'run':
            runner.run_both_services(args.api_port, args.dashboard_port)
            
        elif args.command == 'train':
            runner.train_models(args.force_retrain)
            
        elif args.command == 'check':
            success = runner.check_system()
            sys.exit(0 if success else 1)
            
        elif args.command == 'test':
            success = runner.run_tests()
            sys.exit(0 if success else 1)
            
        elif args.command == 'generate-data':
            runner.generate_sample_data(args.samples)
            
        elif args.command == 'status':
            runner.show_status()
            
    except KeyboardInterrupt:
        logger.info("Application interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Application error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()