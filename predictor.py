"""
Advanced prediction engine and health analysis for Battery RUL Prediction System.
Provides comprehensive battery health assessment with uncertainty quantification.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, timedelta
import warnings
from loguru import logger
from config import settings
from data_processor import data_processor, validate_prediction_input
from models import model_manager

warnings.filterwarnings('ignore')


class HealthAnalyzer:
    """Advanced battery health analysis with risk assessment."""
    
    @staticmethod
    def get_health_status(rul: float, sop: float) -> Tuple[str, str, str]:
        """Determine battery health status based on RUL and SOP values."""
        
        # Determine RUL status
        if rul <= settings.rul_critical_threshold:
            rul_status = "critical"
        elif rul <= settings.rul_warning_threshold:
            rul_status = "warning"
        else:
            rul_status = "healthy"
        
        # Determine SOP status
        if sop <= settings.sop_critical_threshold:
            sop_status = "critical"
        elif sop <= settings.sop_warning_threshold:
            sop_status = "warning"
        else:
            sop_status = "healthy"
        
        # Overall status (worst of the two)
        status_priority = {"critical": 3, "warning": 2, "healthy": 1}
        overall_status = max([rul_status, sop_status], key=lambda x: status_priority[x])
        
        # Generate status message
        if overall_status == "critical":
            message = "Battery requires immediate attention or replacement"
            color = "#e74c3c"  # Red
        elif overall_status == "warning":
            message = "Battery performance is declining - monitor closely"
            color = "#f39c12"  # Orange
        else:
            message = "Battery is operating within normal parameters"
            color = "#2ecc71"  # Green
        
        return overall_status, message, color
    
    @staticmethod
    def generate_recommendations(rul: float, sop: float, input_data: Dict[str, Any]) -> List[str]:
        """Generate actionable maintenance recommendations."""
        recommendations = []
        
        # RUL-based recommendations
        if rul <= settings.rul_critical_threshold:
            recommendations.append("🔴 CRITICAL: Schedule immediate battery replacement")
            recommendations.append("⚠️ Avoid high-power operations until replacement")
        elif rul <= settings.rul_warning_threshold:
            recommendations.append("🟡 WARNING: Plan battery replacement within 2-4 weeks")
            recommendations.append("📊 Increase monitoring frequency to daily")
        
        # SOP-based recommendations
        if sop <= settings.sop_critical_threshold:
            recommendations.append("🔋 Performance critically degraded - reduce load demands")
            recommendations.append("🌡️ Check operating temperature and cooling systems")
        elif sop <= settings.sop_warning_threshold:
            recommendations.append("📈 Performance declining - optimize charging patterns")
        
        # Temperature-based recommendations
        if 'ambient_temperature' in input_data:
            temp = input_data['ambient_temperature']
            if temp > 35:
                recommendations.append("🌡️ HIGH TEMP: Improve battery cooling - high temperature accelerates degradation")
            elif temp < 5:
                recommendations.append("❄️ LOW TEMP: Consider battery heating - cold temperatures reduce performance")
        
        # Resistance-based recommendations
        if 'Re' in input_data and 'Rct' in input_data:
            total_resistance = input_data['Re'] + input_data['Rct']
            if total_resistance > 0.3:
                recommendations.append("⚡ High internal resistance detected - check connections and electrolyte")
        
        # Capacity-based recommendations
        if 'Capacity' in input_data:
            capacity = input_data['Capacity']
            if capacity < 0.8:
                recommendations.append("🔋 Low capacity - consider recalibration or cell balancing")
        
        # General recommendations
        if not recommendations:
            recommendations.append("✅ Battery is healthy - continue regular monitoring")
            recommendations.append("📅 Schedule next inspection in 30 days")
        
        return recommendations
    
    @staticmethod
    def calculate_risk_metrics(rul: float, sop: float) -> Dict[str, Any]:
        """Calculate comprehensive risk metrics."""
        
        # Failure probability based on RUL and SOP
        rul_risk = max(0, (settings.rul_warning_threshold - rul) / settings.rul_warning_threshold)
        sop_risk = max(0, (settings.sop_warning_threshold - sop) / settings.sop_warning_threshold)
        
        # Combined risk score (0-1)
        combined_risk = 0.6 * rul_risk + 0.4 * sop_risk
        combined_risk = min(1.0, combined_risk)
        
        # Risk categories
        if combined_risk >= 0.8:
            risk_level = "Very High"
            risk_color = "#c0392b"
        elif combined_risk >= 0.6:
            risk_level = "High"
            risk_color = "#e74c3c"
        elif combined_risk >= 0.4:
            risk_level = "Medium"
            risk_color = "#f39c12"
        elif combined_risk >= 0.2:
            risk_level = "Low"
            risk_color = "#f1c40f"
        else:
            risk_level = "Very Low"
            risk_color = "#2ecc71"
        
        # Time to failure estimate
        if rul > 0:
            # Estimate days until critical threshold
            degradation_rate = max(0.1, combined_risk)  # Minimum degradation rate
            days_to_critical = rul / (degradation_rate * 10)  # Simplified model
            estimated_failure_date = datetime.now() + timedelta(days=days_to_critical)
        else:
            days_to_critical = 0
            estimated_failure_date = datetime.now()
        
        return {
            'risk_score': combined_risk,
            'risk_level': risk_level,
            'risk_color': risk_color,
            'rul_risk': rul_risk,
            'sop_risk': sop_risk,
            'days_to_critical': int(days_to_critical),
            'estimated_failure_date': estimated_failure_date.strftime('%Y-%m-%d'),
            'confidence': max(0.7, 1.0 - combined_risk * 0.3)  # Higher risk = lower confidence
        }
    
    @staticmethod
    def calculate_cost_analysis(rul: float, sop: float, battery_cost: float = 5000) -> Dict[str, Any]:
        """Calculate cost analysis for battery replacement and maintenance."""
        
        # Performance loss cost (based on SOP degradation)
        performance_loss = max(0, 1 - sop)
        annual_energy_cost = 2000  # Estimated annual energy cost
        performance_cost_per_year = annual_energy_cost * performance_loss * 0.2  # 20% impact factor
        
        # Maintenance cost increase due to degradation
        base_maintenance_cost = 500  # Annual base maintenance
        degradation_factor = max(0, (settings.rul_warning_threshold - rul) / settings.rul_warning_threshold)
        additional_maintenance_cost = base_maintenance_cost * degradation_factor
        
        # Total cost of keeping current battery
        years_remaining = max(0.1, rul / 365)  # Convert RUL to years
        total_degradation_cost = (performance_cost_per_year + additional_maintenance_cost) * years_remaining
        
        # Replacement cost analysis
        replacement_cost = battery_cost
        new_battery_annual_cost = 100  # Lower maintenance cost for new battery
        new_battery_cost_over_rul_period = new_battery_annual_cost * years_remaining
        
        # ROI calculation
        net_savings = total_degradation_cost - (replacement_cost + new_battery_cost_over_rul_period)
        roi_percentage = (net_savings / replacement_cost) * 100 if replacement_cost > 0 else 0
        
        # Recommendation
        if net_savings > 0:
            recommendation = "Replace battery - positive ROI"
        else:
            recommendation = "Continue with current battery"
        
        return {
            'current_battery_total_cost': total_degradation_cost,
            'replacement_cost': replacement_cost,
            'new_battery_cost_over_period': new_battery_cost_over_rul_period,
            'total_replacement_cost': replacement_cost + new_battery_cost_over_period,
            'net_savings': net_savings,
            'roi_percentage': roi_percentage,
            'years_remaining': years_remaining,
            'recommendation': recommendation,
            'performance_cost_per_year': performance_cost_per_year,
            'additional_maintenance_cost': additional_maintenance_cost
        }


class PredictionEngine:
    """Advanced prediction engine with ensemble modeling and uncertainty quantification."""
    
    def __init__(self):
        self.health_analyzer = HealthAnalyzer()
        self.prediction_cache = {}
        self.model_loaded = False
        
    def load_models(self):
        """Load all available models."""
        try:
            model_manager.load_models()
            self.model_loaded = True
            logger.info("Models loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load models: {str(e)}")
            self.model_loaded = False
    
    def predict_single(self, input_data: Dict[str, Any], model_name: str = None) -> Dict[str, Any]:
        """Make prediction for a single battery measurement."""
        logger.info(f"Making prediction for battery {input_data.get('battery_id', 'unknown')}")
        
        # Validate input
        validation_result = validate_prediction_input(input_data)
        if not validation_result['is_valid']:
            raise ValueError(f"Invalid input data: {validation_result['errors']}")
        
        # Convert to DataFrame
        df = pd.DataFrame([input_data])
        
        # Process data
        X_processed, _, _ = data_processor.process_data(df, is_training=False)
        
        # Make prediction
        if not self.model_loaded:
            self.load_models()
        
        if not self.model_loaded:
            raise ValueError("No models available for prediction")
        
        # Get predictions from model
        rul_pred, sop_pred = model_manager.predict(X_processed, model_name)
        
        # Handle array outputs
        if isinstance(rul_pred, np.ndarray):
            rul_value = float(rul_pred[0]) if len(rul_pred) > 0 else float(rul_pred)
        else:
            rul_value = float(rul_pred)
            
        if isinstance(sop_pred, np.ndarray):
            sop_value = float(sop_pred[0]) if len(sop_pred) > 0 else float(sop_pred)
        else:
            sop_value = float(sop_pred)
        
        # Ensure valid ranges
        rul_value = max(0, min(rul_value, settings.max_expected_rul))
        sop_value = max(0, min(sop_value, 1.0))
        
        # Health analysis
        health_status, status_message, status_color = self.health_analyzer.get_health_status(rul_value, sop_value)
        recommendations = self.health_analyzer.generate_recommendations(rul_value, sop_value, input_data)
        risk_metrics = self.health_analyzer.calculate_risk_metrics(rul_value, sop_value)
        cost_analysis = self.health_analyzer.calculate_cost_analysis(rul_value, sop_value)
        
        # Compile results
        results = {
            'battery_id': input_data.get('battery_id', 'unknown'),
            'prediction_timestamp': datetime.now().isoformat(),
            'model_used': model_name or model_manager.best_model_name,
            
            # Predictions
            'rul': rul_value,
            'sop': sop_value,
            'rul_days': rul_value,  # Assuming RUL is in days
            'sop_percentage': sop_value * 100,
            
            # Health status
            'health_status': health_status,
            'status_message': status_message,
            'status_color': status_color,
            
            # Analysis
            'recommendations': recommendations,
            'risk_metrics': risk_metrics,
            'cost_analysis': cost_analysis,
            
            # Input data summary
            'input_summary': {
                'capacity': input_data.get('Capacity', 0),
                'temperature': input_data.get('ambient_temperature', 0),
                'total_resistance': input_data.get('Re', 0) + input_data.get('Rct', 0),
                'type': input_data.get('type', 0)
            },
            
            # Metadata
            'processing_info': {
                'validation_warnings': validation_result.get('warnings', []),
                'features_used': len(X_processed[0]) if len(X_processed) > 0 else 0,
                'model_confidence': risk_metrics['confidence']
            }
        }
        
        logger.info(f"Prediction completed - RUL: {rul_value:.1f}, SOP: {sop_value:.3f}, Status: {health_status}")
        
        return results
    
    def predict_batch(self, input_data_list: List[Dict[str, Any]], model_name: str = None) -> List[Dict[str, Any]]:
        """Make predictions for multiple battery measurements."""
        logger.info(f"Making batch predictions for {len(input_data_list)} batteries")
        
        results = []
        for i, input_data in enumerate(input_data_list):
            try:
                result = self.predict_single(input_data, model_name)
                result['batch_index'] = i
                results.append(result)
            except Exception as e:
                logger.error(f"Failed to predict for batch item {i}: {str(e)}")
                results.append({
                    'batch_index': i,
                    'error': str(e),
                    'battery_id': input_data.get('battery_id', f'unknown_{i}')
                })
        
        logger.info(f"Batch prediction completed: {len([r for r in results if 'error' not in r])}/{len(results)} successful")
        
        return results
    
    def predict_from_dataframe(self, df: pd.DataFrame, model_name: str = None) -> pd.DataFrame:
        """Make predictions from a pandas DataFrame."""
        logger.info(f"Making predictions from DataFrame with {len(df)} rows")
        
        # Convert DataFrame to list of dictionaries
        input_data_list = df.to_dict('records')
        
        # Make batch predictions
        results = self.predict_batch(input_data_list, model_name)
        
        # Convert results back to DataFrame
        results_df = pd.DataFrame(results)
        
        return results_df
    
    def get_prediction_trends(self, battery_id: str, days_back: int = 30) -> Dict[str, Any]:
        """Get prediction trends for a specific battery (placeholder for future implementation)."""
        # This would typically query historical predictions from a database
        # For now, return a placeholder structure
        
        return {
            'battery_id': battery_id,
            'trend_period_days': days_back,
            'rul_trend': 'stable',  # 'improving', 'degrading', 'stable'
            'sop_trend': 'degrading',
            'prediction_count': 0,
            'average_rul': 0,
            'average_sop': 0,
            'trend_analysis': "Insufficient historical data for trend analysis"
        }
    
    def generate_health_report(self, input_data: Dict[str, Any], model_name: str = None) -> Dict[str, Any]:
        """Generate a comprehensive health report for a battery."""
        logger.info("Generating comprehensive health report")
        
        # Get prediction
        prediction_result = self.predict_single(input_data, model_name)
        
        # Get trends (placeholder)
        battery_id = input_data.get('battery_id', 'unknown')
        trends = self.get_prediction_trends(battery_id)
        
        # Compile comprehensive report
        report = {
            'report_id': f"health_report_{battery_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'generated_at': datetime.now().isoformat(),
            'battery_id': battery_id,
            
            # Executive summary
            'executive_summary': {
                'overall_health': prediction_result['health_status'],
                'immediate_action_required': prediction_result['health_status'] == 'critical',
                'estimated_replacement_date': prediction_result['risk_metrics']['estimated_failure_date'],
                'key_concerns': [rec for rec in prediction_result['recommendations'] if '🔴' in rec or '⚠️' in rec]
            },
            
            # Detailed predictions
            'predictions': prediction_result,
            
            # Trends
            'trends': trends,
            
            # Detailed analysis
            'detailed_analysis': {
                'capacity_analysis': {
                    'current_capacity': input_data.get('Capacity', 0),
                    'capacity_rating': 'Good' if input_data.get('Capacity', 0) > 0.8 else 'Poor',
                    'capacity_impact': 'High' if input_data.get('Capacity', 0) < 0.7 else 'Low'
                },
                'resistance_analysis': {
                    'electrolyte_resistance': input_data.get('Re', 0),
                    'charge_transfer_resistance': input_data.get('Rct', 0),
                    'total_resistance': input_data.get('Re', 0) + input_data.get('Rct', 0),
                    'resistance_rating': 'Good' if (input_data.get('Re', 0) + input_data.get('Rct', 0)) < 0.25 else 'High'
                },
                'environmental_analysis': {
                    'temperature': input_data.get('ambient_temperature', 0),
                    'temperature_impact': 'Optimal' if 15 <= input_data.get('ambient_temperature', 25) <= 35 else 'Suboptimal',
                    'operating_conditions': 'Normal' if input_data.get('type', 0) == 0 else 'Stressed'
                }
            }
        }
        
        logger.info("Health report generated successfully")
        
        return report


# Global prediction engine instance
prediction_engine = PredictionEngine()


def get_model_info() -> Dict[str, Any]:
    """Get information about available models."""
    return model_manager.get_model_info()


def create_sample_prediction() -> Dict[str, Any]:
    """Create a sample prediction for testing."""
    from data_processor import create_sample_input
    
    sample_input = create_sample_input()
    
    # Try to make a prediction
    try:
        result = prediction_engine.predict_single(sample_input)
        return result
    except Exception as e:
        logger.warning(f"Could not make sample prediction: {str(e)}")
        return {
            'error': str(e),
            'sample_input': sample_input,
            'message': 'Train models first using the training script'
        }