"""
Advanced data processing and validation for Battery RUL Prediction System.
Includes feature engineering, data cleaning, and validation with optimized performance.
"""

import numpy as np
import pandas as pd
from typing import Tuple, Dict, List, Optional, Any
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.impute import SimpleImputer
from scipy import stats
from scipy.signal import savgol_filter
import warnings
from loguru import logger
from config import settings

warnings.filterwarnings('ignore')


class DataValidator:
    """Professional data validation with comprehensive checks."""
    
    @staticmethod
    def validate_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
        """Validate input dataframe and return validation report."""
        validation_report = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'stats': {}
        }
        
        # Check if DataFrame is empty
        if df.empty:
            validation_report['is_valid'] = False
            validation_report['errors'].append("DataFrame is empty")
            return validation_report
        
        # Check required columns
        missing_columns = set(settings.required_columns) - set(df.columns)
        if missing_columns:
            validation_report['is_valid'] = False
            validation_report['errors'].append(f"Missing required columns: {missing_columns}")
        
        # Check data types and ranges
        for col in settings.required_columns:
            if col in df.columns:
                # Check for null values
                null_count = df[col].isnull().sum()
                if null_count > 0:
                    validation_report['warnings'].append(f"{col} has {null_count} null values")
                
                # Check data ranges
                if col == 'type' and df[col].dtype in ['int64', 'float64']:
                    invalid_types = df[~df[col].isin([-1, 0, 1])][col].count()
                    if invalid_types > 0:
                        validation_report['warnings'].append(f"{col} has {invalid_types} invalid values (should be -1, 0, or 1)")
                
                elif col == 'ambient_temperature':
                    temp_range = df[col].describe()
                    if temp_range['min'] < -50 or temp_range['max'] > 100:
                        validation_report['warnings'].append(f"{col} has extreme values (min: {temp_range['min']}, max: {temp_range['max']})")
                
                elif col == 'Capacity':
                    if (df[col] <= 0).any():
                        validation_report['warnings'].append(f"{col} has non-positive values")
                
                elif col in ['Re', 'Rct']:
                    if (df[col] <= 0).any():
                        validation_report['warnings'].append(f"{col} has non-positive resistance values")
        
        # Basic statistics
        validation_report['stats'] = {
            'row_count': len(df),
            'column_count': len(df.columns),
            'memory_usage_mb': df.memory_usage(deep=True).sum() / 1024 / 1024,
            'duplicate_rows': df.duplicated().sum(),
            'numeric_columns': df.select_dtypes(include=[np.number]).columns.tolist(),
            'categorical_columns': df.select_dtypes(include=['object']).columns.tolist()
        }
        
        logger.info(f"Data validation completed: {validation_report['stats']}")
        
        return validation_report


class FeatureEngineer:
    """Advanced feature engineering for battery data."""
    
    def __init__(self):
        self.feature_names = []
        self.scaler = StandardScaler()
        
    def create_advanced_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create advanced engineered features for better prediction accuracy."""
        logger.info("Creating advanced features...")
        
        df_features = df.copy()
        
        # Basic features (ensure they exist)
        required_features = ['type', 'ambient_temperature', 'battery_id', 'test_id', 'Capacity', 'Re', 'Rct']
        for feature in required_features:
            if feature not in df_features.columns:
                logger.warning(f"Required feature {feature} not found, setting to default")
                if feature == 'type':
                    df_features[feature] = 0
                elif feature in ['battery_id', 'test_id']:
                    df_features[feature] = 1
                elif feature == 'ambient_temperature':
                    df_features[feature] = 25.0
                elif feature == 'Capacity':
                    df_features[feature] = 1.0
                elif feature in ['Re', 'Rct']:
                    df_features[feature] = 0.1
        
        # Advanced Feature Engineering
        
        # 1. Resistance-based features
        df_features['total_resistance'] = df_features['Re'] + df_features['Rct']
        df_features['resistance_ratio'] = df_features['Re'] / (df_features['Rct'] + 1e-6)
        df_features['resistance_product'] = df_features['Re'] * df_features['Rct']
        
        # 2. Capacity-based features
        df_features['capacity_per_temp'] = df_features['Capacity'] / (df_features['ambient_temperature'] + 273.15)
        df_features['capacity_efficiency'] = df_features['Capacity'] / (df_features['total_resistance'] + 1e-6)
        
        # 3. Temperature effects
        df_features['temp_kelvin'] = df_features['ambient_temperature'] + 273.15
        df_features['temp_normalized'] = (df_features['ambient_temperature'] - 25) / 25  # Normalized around 25°C
        df_features['temp_squared'] = df_features['ambient_temperature'] ** 2
        
        # 4. Degradation indicators
        df_features['degradation_factor'] = df_features['Re'] * df_features['Rct'] / (df_features['Capacity'] + 1e-6)
        df_features['health_indicator'] = df_features['Capacity'] / (1 + df_features['total_resistance'])
        
        # 5. Interaction features
        df_features['re_temp_interaction'] = df_features['Re'] * df_features['temp_normalized']
        df_features['rct_temp_interaction'] = df_features['Rct'] * df_features['temp_normalized']
        df_features['capacity_temp_interaction'] = df_features['Capacity'] * df_features['temp_normalized']
        
        # 6. Polynomial features for key variables
        df_features['re_squared'] = df_features['Re'] ** 2
        df_features['rct_squared'] = df_features['Rct'] ** 2
        df_features['capacity_squared'] = df_features['Capacity'] ** 2
        
        # 7. Logarithmic features (for non-linear relationships)
        df_features['log_re'] = np.log(df_features['Re'] + 1e-6)
        df_features['log_rct'] = np.log(df_features['Rct'] + 1e-6)
        df_features['log_capacity'] = np.log(df_features['Capacity'] + 1e-6)
        
        # 8. Advanced ratios
        df_features['capacity_re_ratio'] = df_features['Capacity'] / (df_features['Re'] + 1e-6)
        df_features['capacity_rct_ratio'] = df_features['Capacity'] / (df_features['Rct'] + 1e-6)
        
        # 9. Statistical features (if multiple measurements per battery)
        if 'battery_id' in df_features.columns:
            # Group by battery for rolling statistics
            battery_groups = df_features.groupby('battery_id')
            
            # Rolling statistics for capacity
            df_features['capacity_rolling_mean'] = battery_groups['Capacity'].transform(
                lambda x: x.rolling(window=3, min_periods=1).mean()
            )
            df_features['capacity_rolling_std'] = battery_groups['Capacity'].transform(
                lambda x: x.rolling(window=3, min_periods=1).std().fillna(0)
            )
            
            # Rolling statistics for resistances
            df_features['re_rolling_mean'] = battery_groups['Re'].transform(
                lambda x: x.rolling(window=3, min_periods=1).mean()
            )
            df_features['rct_rolling_mean'] = battery_groups['Rct'].transform(
                lambda x: x.rolling(window=3, min_periods=1).mean()
            )
            
            # Degradation trend features
            df_features['capacity_trend'] = battery_groups['Capacity'].transform(
                lambda x: x.diff().fillna(0)
            )
            df_features['re_trend'] = battery_groups['Re'].transform(
                lambda x: x.diff().fillna(0)
            )
            df_features['rct_trend'] = battery_groups['Rct'].transform(
                lambda x: x.diff().fillna(0)
            )
        
        # 10. Fourier features for cyclical patterns
        if len(df_features) > 10:
            # Simple cyclical encoding for sequence position
            sequence_pos = np.arange(len(df_features))
            df_features['cycle_sin'] = np.sin(2 * np.pi * sequence_pos / len(df_features))
            df_features['cycle_cos'] = np.cos(2 * np.pi * sequence_pos / len(df_features))
        
        # Store feature names for later use (handled in process_data instead)
        # self.feature_names = [col for col in df_features.columns if col not in ['battery_id', 'test_id']]
        
        logger.info(f"Created {len(df_features.columns) - len(df.columns)} new features")
        logger.info(f"Total features: {len(df_features.columns)}")
        
        return df_features
    
    def create_target_variables(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Create target variables (RUL and SOP) from battery data."""
        logger.info("Creating target variables...")
        
        # RUL Calculation (Remaining Useful Life)
        # Using capacity degradation model
        capacity = df['Capacity'].values
        re = df['Re'].values
        rct = df['Rct'].values
        
        # Advanced RUL calculation considering multiple factors
        degradation_rate = re * rct / (capacity + 1e-6)
        baseline_degradation = np.mean(degradation_rate)
        
        # Normalize degradation rate
        normalized_degradation = degradation_rate / (baseline_degradation + 1e-6)
        
        # Calculate RUL using exponential decay model
        rul = settings.max_expected_rul / (1 + 2 * normalized_degradation)
        rul = np.clip(rul, 0, settings.max_expected_rul)
        
        # SOP Calculation (State of Performance)
        # Based on capacity retention and resistance growth
        max_capacity = np.max(capacity) if len(capacity) > 1 else capacity[0]
        min_resistance = np.min(re + rct) if len(re + rct) > 1 else (re[0] + rct[0])
        
        # Capacity factor (0-1)
        capacity_factor = capacity / (max_capacity + 1e-6)
        
        # Resistance factor (0-1, inverted)
        resistance_factor = min_resistance / (re + rct + 1e-6)
        
        # Combined SOP with weighted factors
        sop = 0.6 * capacity_factor + 0.4 * resistance_factor
        sop = np.clip(sop, 0, 1)
        
        logger.info(f"Target variables created - RUL range: [{np.min(rul):.1f}, {np.max(rul):.1f}], "
                   f"SOP range: [{np.min(sop):.3f}, {np.max(sop):.3f}]")
        
        return rul, sop


class DataProcessor:
    """Main data processing pipeline with optimization for performance."""
    
    def __init__(self):
        self.validator = DataValidator()
        self.feature_engineer = FeatureEngineer()
        self.scaler = RobustScaler()  # More robust to outliers
        self.imputer = SimpleImputer(strategy='median')
        self.is_fitted = False
        
    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and preprocess raw data."""
        logger.info("Cleaning data...")
        
        df_clean = df.copy()
        
        # 1. Remove completely empty rows
        df_clean = df_clean.dropna(how='all')
        
        # 2. Handle missing values in required columns
        for col in settings.required_columns:
            if col in df_clean.columns:
                if df_clean[col].dtype in ['int64', 'float64']:
                    # Use median for numeric columns
                    median_val = df_clean[col].median()
                    df_clean[col] = df_clean[col].fillna(median_val)
                else:
                    # Use mode for categorical columns
                    mode_val = df_clean[col].mode().iloc[0] if not df_clean[col].mode().empty else 'unknown'
                    df_clean[col] = df_clean[col].fillna(mode_val)
        
        # 3. Remove outliers using IQR method
        numeric_columns = df_clean.select_dtypes(include=[np.number]).columns
        for col in numeric_columns:
            if col in ['Capacity', 'Re', 'Rct']:  # Only for key features
                Q1 = df_clean[col].quantile(0.25)
                Q3 = df_clean[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 3 * IQR  # More lenient outlier detection
                upper_bound = Q3 + 3 * IQR
                
                outlier_mask = (df_clean[col] < lower_bound) | (df_clean[col] > upper_bound)
                outlier_count = outlier_mask.sum()
                
                if outlier_count > 0:
                    logger.info(f"Found {outlier_count} outliers in {col}")
                    # Cap outliers instead of removing
                    df_clean.loc[df_clean[col] < lower_bound, col] = lower_bound
                    df_clean.loc[df_clean[col] > upper_bound, col] = upper_bound
        
        # 4. Ensure positive values for resistance and capacity
        for col in ['Capacity', 'Re', 'Rct']:
            if col in df_clean.columns:
                df_clean[col] = np.maximum(df_clean[col], 1e-6)
        
        # 5. Data type optimization
        for col in df_clean.columns:
            if df_clean[col].dtype == 'int64':
                if df_clean[col].min() >= 0 and df_clean[col].max() <= 255:
                    df_clean[col] = df_clean[col].astype('uint8')
                elif df_clean[col].min() >= -128 and df_clean[col].max() <= 127:
                    df_clean[col] = df_clean[col].astype('int8')
                elif df_clean[col].min() >= -32768 and df_clean[col].max() <= 32767:
                    df_clean[col] = df_clean[col].astype('int16')
                else:
                    df_clean[col] = df_clean[col].astype('int32')
            elif df_clean[col].dtype == 'float64':
                df_clean[col] = pd.to_numeric(df_clean[col], downcast='float')
        
        logger.info(f"Data cleaned: {len(df_clean)} rows, {len(df_clean.columns)} columns")
        
        return df_clean
    
    def process_data(self, df: pd.DataFrame, is_training: bool = True) -> Tuple[np.ndarray, Optional[np.ndarray], Optional[np.ndarray]]:
        """Main data processing pipeline."""
        logger.info(f"Processing data (training: {is_training})...")
        
        # 1. Validate data
        validation_report = self.validator.validate_dataframe(df)
        if not validation_report['is_valid']:
            raise ValueError(f"Data validation failed: {validation_report['errors']}")
        
        # 2. Clean data
        df_clean = self.clean_data(df)
        
        # 3. Feature engineering
        df_features = self.feature_engineer.create_advanced_features(df_clean)
        
        # 4. Prepare features for ML models
        if is_training:
            feature_columns = [col for col in df_features.columns 
                              if col not in ['battery_id', 'test_id'] and 
                              df_features[col].dtype in ['int8', 'int16', 'int32', 'int64', 'float16', 'float32', 'float64']]
            self.feature_engineer.feature_names = feature_columns
        else:
            feature_columns = self.feature_engineer.feature_names
            for col in feature_columns:
                if col not in df_features.columns:
                    df_features[col] = 0.0
        
        X = df_features[feature_columns].values
        
        # 5. Handle any remaining NaN values
        if np.isnan(X).any():
            if not self.is_fitted:
                X = self.imputer.fit_transform(X)
            else:
                X = self.imputer.transform(X)
        
        # 6. Scale features
        if is_training:
            X_scaled = self.scaler.fit_transform(X)
            self.is_fitted = True
        else:
            if not self.is_fitted:
                raise ValueError("Scaler not fitted. Please process training data first.")
            X_scaled = self.scaler.transform(X)
        
        # 7. Create target variables (only for training)
        if is_training:
            y_rul, y_sop = self.feature_engineer.create_target_variables(df_features)
            logger.info(f"Processed training data: X shape {X_scaled.shape}, y_rul shape {y_rul.shape}, y_sop shape {y_sop.shape}")
            return X_scaled, y_rul, y_sop
        else:
            logger.info(f"Processed prediction data: X shape {X_scaled.shape}")
            return X_scaled, None, None
    
    def create_sequences(self, X: np.ndarray, y_rul: np.ndarray = None, 
                        y_sop: np.ndarray = None, sequence_length: int = None) -> Tuple[np.ndarray, ...]:
        """Create sequences for time-series models."""
        seq_len = sequence_length or settings.sequence_length
        
        if len(X) < seq_len:
            # Pad sequence if data is shorter than required sequence length
            padded_X = np.zeros((seq_len, X.shape[1]))
            padded_X[-len(X):] = X
            X_sequences = padded_X.reshape(1, seq_len, X.shape[1])
            
            if y_rul is not None and y_sop is not None:
                return X_sequences, np.array([y_rul[-1]]), np.array([y_sop[-1]])
            else:
                return X_sequences
        
        # Create sequences
        X_sequences = []
        y_rul_sequences = []
        y_sop_sequences = []
        
        for i in range(len(X) - seq_len + 1):
            X_sequences.append(X[i:i + seq_len])
            if y_rul is not None:
                y_rul_sequences.append(y_rul[i + seq_len - 1])
            if y_sop is not None:
                y_sop_sequences.append(y_sop[i + seq_len - 1])
        
        X_sequences = np.array(X_sequences)
        
        if y_rul is not None and y_sop is not None:
            return X_sequences, np.array(y_rul_sequences), np.array(y_sop_sequences)
        else:
            return X_sequences
    
    def save_processor(self, filepath: str):
        """Save the data processor state."""
        import joblib
        processor_data = {
            'scaler': self.scaler,
            'imputer': self.imputer,
            'is_fitted': self.is_fitted,
            'feature_names': getattr(self.feature_engineer, 'feature_names', [])
        }
        joblib.dump(processor_data, filepath)
        logger.info(f"Data processor saved to {filepath}")
    
    def load_processor(self, filepath: str):
        """Load the data processor state."""
        import joblib
        processor_data = joblib.load(filepath)
        self.scaler = processor_data['scaler']
        self.imputer = processor_data['imputer']
        self.is_fitted = processor_data['is_fitted']
        self.feature_engineer.feature_names = processor_data.get('feature_names', [])
        logger.info(f"Data processor loaded from {filepath}")
    
    def get_feature_importance(self, feature_names: List[str], importance_scores: np.ndarray) -> Dict[str, float]:
        """Get feature importance mapping."""
        if len(feature_names) != len(importance_scores):
            logger.warning("Feature names and importance scores length mismatch")
            return {}
        
        feature_importance = dict(zip(feature_names, importance_scores))
        # Sort by importance
        feature_importance = dict(sorted(feature_importance.items(), key=lambda x: x[1], reverse=True))
        
        return feature_importance


def load_sample_data() -> pd.DataFrame:
    """Load or generate sample battery data for testing."""
    sample_data_path = settings.data_dir / "sample_battery_data.csv"
    
    if sample_data_path.exists():
        logger.info("Loading sample data from file")
        return pd.read_csv(sample_data_path)
    
    logger.info("Generating synthetic sample data")
    
    # Generate realistic synthetic battery data
    np.random.seed(settings.random_seed)
    n_samples = 1000
    n_batteries = 10
    
    data = []
    
    for battery_id in range(1, n_batteries + 1):
        # Simulate battery degradation over time
        cycles = np.random.randint(50, 200)  # Random number of cycles per battery
        
        for cycle in range(cycles):
            # Simulate degradation
            degradation_factor = cycle / cycles
            
            # Base values with degradation
            base_capacity = 1.0 - 0.3 * degradation_factor + np.random.normal(0, 0.05)
            base_re = 0.05 + 0.02 * degradation_factor + np.random.normal(0, 0.005)
            base_rct = 0.15 + 0.05 * degradation_factor + np.random.normal(0, 0.01)
            
            # Environmental factors
            temp = np.random.normal(25, 10)  # Temperature variation
            temp_factor = 1 + 0.01 * (temp - 25)  # Temperature effect
            
            data.append({
                'battery_id': battery_id,
                'test_id': f"test_{battery_id}_{cycle}",
                'type': np.random.choice([-1, 0, 1]),
                'ambient_temperature': temp,
                'Capacity': max(0.1, base_capacity * temp_factor),
                'Re': max(0.001, base_re * temp_factor),
                'Rct': max(0.001, base_rct * temp_factor),
                'cycle': cycle,
                'timestamp': pd.Timestamp.now() - pd.Timedelta(days=cycles-cycle)
            })
    
    df = pd.DataFrame(data)
    
    # Save sample data
    df.to_csv(sample_data_path, index=False)
    logger.info(f"Generated and saved {len(df)} sample records")
    
    return df


def validate_prediction_input(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate input data for predictions."""
    errors = []
    warnings = []
    
    # Check required fields
    for field in settings.required_columns:
        if field not in data:
            errors.append(f"Missing required field: {field}")
        elif data[field] is None:
            errors.append(f"Field {field} cannot be None")
    
    # Validate data ranges
    if 'type' in data and data['type'] not in [-1, 0, 1]:
        errors.append("Type must be -1, 0, or 1")
    
    if 'ambient_temperature' in data:
        temp = data['ambient_temperature']
        if temp < -50 or temp > 100:
            warnings.append(f"Unusual temperature value: {temp}°C")
    
    if 'Capacity' in data and data['Capacity'] <= 0:
        errors.append("Capacity must be positive")
    
    if 'Re' in data and data['Re'] <= 0:
        errors.append("Electrolyte resistance (Re) must be positive")
    
    if 'Rct' in data and data['Rct'] <= 0:
        errors.append("Charge transfer resistance (Rct) must be positive")
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings
    }


def create_sample_input() -> Dict[str, Any]:
    """Create sample input data for testing."""
    return {
        'type': 0,
        'ambient_temperature': 25.0,
        'battery_id': 1,
        'test_id': 'test_001',
        'Capacity': 0.95,
        'Re': 0.055,
        'Rct': 0.165
    }


# Global data processor instance
data_processor = DataProcessor()