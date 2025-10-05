import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.neural_network import MLPRegressor
from sklearn.model_selection import train_test_split, GridSearchCV, TimeSeriesSplit
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
import xgboost as xgb
import joblib
import logging
from datetime import datetime, timedelta
import os
import json
import requests
from typing import Dict, List, Optional, Tuple
import warnings
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AdvancedDemandPredictor:
    """
    Advanced machine learning system for predicting laundry demand using ensemble methods,
    weather data integration, and real-time IoT sensor feedback.
    """

    def __init__(self, config_path: Optional[str] = None):
        """Initialize the advanced demand predictor"""
        self.models = {}
        self.ensemble_weights = {}
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_columns = []
        self.is_trained = False
        
        # Load configuration
        self.config = self._load_config(config_path)
        
        # Initialize model ensemble
        self._initialize_models()

    def _load_config(self, config_path: Optional[str]) -> Dict:
        """Load configuration from file or use defaults"""
        default_config = {
            "weather_api_key": os.getenv("WEATHER_API_KEY"),
            "weather_api_url": "http://api.openweathermap.org/data/2.5/weather",
            "model_params": {
                "random_forest": {
                    "n_estimators": 200,
                    "max_depth": 15,
                    "min_samples_split": 5,
                    "min_samples_leaf": 2
                },
                "xgboost": {
                    "n_estimators": 150,
                    "max_depth": 8,
                    "learning_rate": 0.1,
                    "subsample": 0.8
                },
                "gradient_boosting": {
                    "n_estimators": 100,
                    "max_depth": 6,
                    "learning_rate": 0.15
                },
                "neural_network": {
                    "hidden_layer_sizes": (100, 50),
                    "max_iter": 500,
                    "alpha": 0.001
                }
            },
            "ensemble_weights": {
                "random_forest": 0.3,
                "xgboost": 0.35,
                "gradient_boosting": 0.25,
                "neural_network": 0.1
            }
        }
        
        if config_path and os.path.exists(config_path):
            with open(config_path, 'r') as f:
                user_config = json.load(f)
                default_config.update(user_config)
        
        return default_config

    def _initialize_models(self):
        """Initialize the ensemble of models"""
        params = self.config["model_params"]
        
        self.models = {
            "random_forest": RandomForestRegressor(
                random_state=42,
                n_jobs=-1,
                **params["random_forest"]
            ),
            "xgboost": xgb.XGBRegressor(
                random_state=42,
                n_jobs=-1,
                **params["xgboost"]
            ),
            "gradient_boosting": GradientBoostingRegressor(
                random_state=42,
                **params["gradient_boosting"]
            ),
            "neural_network": MLPRegressor(
                random_state=42,
                **params["neural_network"]
            )
        }
        
        self.ensemble_weights = self.config["ensemble_weights"]

    def prepare_features(self, data: pd.DataFrame, target_col: str = 'demand') -> Tuple[pd.DataFrame, pd.Series]:
        """Prepare comprehensive features for machine learning"""
        logger.info("Preparing features for model training/prediction...")
        
        df = data.copy()
        
        # Ensure datetime column
        if 'timestamp' not in df.columns:
            df['timestamp'] = pd.to_datetime(df.index)
        else:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Time-based features
        df['hour'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        df['month'] = df['timestamp'].dt.month
        df['day_of_month'] = df['timestamp'].dt.day
        df['quarter'] = df['timestamp'].dt.quarter
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        df['is_monday'] = (df['day_of_week'] == 0).astype(int)
        df['is_friday'] = (df['day_of_week'] == 4).astype(int)
        
        # Peak hours
        df['is_morning_peak'] = ((df['hour'] >= 7) & (df['hour'] <= 9)).astype(int)
        df['is_evening_peak'] = ((df['hour'] >= 18) & (df['hour'] <= 21)).astype(int)
        df['is_night'] = ((df['hour'] >= 22) | (df['hour'] <= 6)).astype(int)
        
        # Seasonal features
        df['season'] = ((df['month'] % 12 + 3) // 3).map({1: 'Winter', 2: 'Spring', 3: 'Summer', 4: 'Fall'})
        
        # Holiday features (simplified)
        df['is_holiday'] = self._determine_holidays(df['timestamp'])
        df['days_to_holiday'] = self._days_to_next_holiday(df['timestamp'])
        df['days_from_holiday'] = self._days_from_last_holiday(df['timestamp'])
        
        # Weather features (if available)
        if 'temperature' in df.columns:
            df['temp_category'] = pd.cut(df['temperature'], 
                                       bins=[-np.inf, 10, 20, 30, np.inf], 
                                       labels=['Cold', 'Cool', 'Warm', 'Hot'])
        
        if 'humidity' in df.columns:
            df['humidity_high'] = (df['humidity'] > 70).astype(int)
        
        if 'weather_condition' in df.columns:
            df['is_rainy'] = df['weather_condition'].str.contains('rain|storm', case=False, na=False).astype(int)
            df['is_sunny'] = df['weather_condition'].str.contains('clear|sunny', case=False, na=False).astype(int)
        
        # Lagging features
        if target_col in df.columns:
            for lag in [1, 2, 3, 7, 14]:
                df[f'demand_lag_{lag}'] = df[target_col].shift(lag)
            
            # Rolling statistics
            for window in [3, 7, 14, 30]:
                df[f'demand_rolling_mean_{window}'] = df[target_col].rolling(window=window).mean()
                df[f'demand_rolling_std_{window}'] = df[target_col].rolling(window=window).std()
                df[f'demand_rolling_max_{window}'] = df[target_col].rolling(window=window).max()
                df[f'demand_rolling_min_{window}'] = df[target_col].rolling(window=window).min()
        
        # Machine utilization features
        if 'machine_count' in df.columns:
            df['machine_utilization'] = df.get('active_machines', 0) / df['machine_count']
        
        # Student population features (if available)
        if 'student_population' in df.columns:
            df['demand_per_student'] = df.get(target_col, 0) / df['student_population']
        
        # Cyclical encoding for time features
        for col, period in [('hour', 24), ('day_of_week', 7), ('month', 12), ('day_of_month', 31)]:
            df[f'{col}_sin'] = np.sin(2 * np.pi * df[col] / period)
            df[f'{col}_cos'] = np.cos(2 * np.pi * df[col] / period)
        
        # Encode categorical variables
        categorical_cols = ['season', 'temp_category']
        for col in categorical_cols:
            if col in df.columns:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                    df[f'{col}_encoded'] = self.label_encoders[col].fit_transform(df[col].astype(str))
                else:
                    # Handle unseen categories
                    known_categories = set(self.label_encoders[col].classes_)
                    df[col] = df[col].astype(str).apply(lambda x: x if x in known_categories else 'Unknown')
                    df[f'{col}_encoded'] = self.label_encoders[col].transform(df[col])
        
        # Select numerical features for training
        feature_cols = [col for col in df.columns if col not in [
            'timestamp', target_col, 'season', 'temp_category', 'weather_condition'
        ] and df[col].dtype in ['int64', 'float64']]
        
        # Remove columns with too many NaN values
        feature_cols = [col for col in feature_cols if df[col].isna().sum() / len(df) < 0.5]
        
        # Fill remaining NaN values
        df[feature_cols] = df[feature_cols].fillna(df[feature_cols].median())
        
        self.feature_columns = feature_cols
        X = df[feature_cols]
        y = df[target_col] if target_col in df.columns else None
        
        logger.info(f"Prepared {len(feature_cols)} features for {len(X)} samples")
        return X, y

    def _determine_holidays(self, timestamps: pd.Series) -> pd.Series:
        """Determine if dates are holidays (simplified implementation)"""
        holidays = []
        for ts in timestamps:
            # Basic holiday detection (can be enhanced with proper holiday library)
            is_holiday = (
                (ts.month == 1 and ts.day == 1) or  # New Year
                (ts.month == 7 and ts.day == 4) or  # Independence Day
                (ts.month == 12 and ts.day == 25) or  # Christmas
                (ts.month == 11 and ts.day == 11)    # Veterans Day
            )
            holidays.append(int(is_holiday))
        return pd.Series(holidays, index=timestamps.index)

    def _days_to_next_holiday(self, timestamps: pd.Series) -> pd.Series:
        """Calculate days to next holiday"""
        # Simplified implementation
        return pd.Series([7] * len(timestamps), index=timestamps.index)

    def _days_from_last_holiday(self, timestamps: pd.Series) -> pd.Series:
        """Calculate days from last holiday"""
        # Simplified implementation
        return pd.Series([7] * len(timestamps), index=timestamps.index)

    def fetch_weather_data(self, location: str) -> Dict:
        """Fetch current weather data from API"""
        if not self.config.get("weather_api_key"):
            logger.warning("Weather API key not configured")
            return {}
        
        try:
            params = {
                'q': location,
                'appid': self.config["weather_api_key"],
                'units': 'metric'
            }
            response = requests.get(self.config["weather_api_url"], params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            return {
                'temperature': data['main']['temp'],
                'humidity': data['main']['humidity'],
                'weather_condition': data['weather'][0]['description'],
                'wind_speed': data['wind']['speed']
            }
        except Exception as e:
            logger.error(f"Failed to fetch weather data: {e}")
            return {}

    def train(self, training_data: pd.DataFrame, target_col: str = 'demand') -> Dict:
        """Train the ensemble of models"""
        logger.info("Starting ensemble model training...")
        
        # Prepare features
        X, y = self.prepare_features(training_data, target_col)
        
        if y is None:
            raise ValueError(f"Target column '{target_col}' not found in training data")
        
        # Remove samples with NaN target values
        valid_mask = ~y.isna()
        X, y = X[valid_mask], y[valid_mask]
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        X_scaled = pd.DataFrame(X_scaled, columns=X.columns, index=X.index)
        
        # Time series split for validation
        tscv = TimeSeriesSplit(n_splits=5)
        
        results = {}
        model_predictions = {}
        
        # Train each model
        for model_name, model in self.models.items():
            logger.info(f"Training {model_name}...")
            
            cv_scores = []
            for train_idx, val_idx in tscv.split(X_scaled):
                X_train_fold, X_val_fold = X_scaled.iloc[train_idx], X_scaled.iloc[val_idx]
                y_train_fold, y_val_fold = y.iloc[train_idx], y.iloc[val_idx]
                
                # Train model
                if model_name == 'neural_network':
                    model.fit(X_train_fold, y_train_fold)
                else:
                    model.fit(X_train_fold, y_train_fold)
                
                # Predict and score
                val_pred = model.predict(X_val_fold)
                cv_scores.append(mean_absolute_error(y_val_fold, val_pred))
            
            avg_cv_score = np.mean(cv_scores)
            logger.info(f"{model_name} CV MAE: {avg_cv_score:.3f}")
            
            # Final training on full dataset
            model.fit(X_scaled, y)
            
            # Get predictions for ensemble weighting
            model_predictions[model_name] = model.predict(X_scaled)
            
            results[model_name] = {
                'cv_mae': avg_cv_score,
                'cv_std': np.std(cv_scores)
            }
        
        # Optimize ensemble weights
        self._optimize_ensemble_weights(model_predictions, y)
        
        # Final evaluation
        ensemble_pred = self._ensemble_predict(model_predictions)
        final_mae = mean_absolute_error(y, ensemble_pred)
        final_r2 = r2_score(y, ensemble_pred)
        
        logger.info(f"Ensemble MAE: {final_mae:.3f}")
        logger.info(f"Ensemble R²: {final_r2:.3f}")
        
        self.is_trained = True
        
        results['ensemble'] = {
            'mae': final_mae,
            'r2': final_r2,
            'weights': self.ensemble_weights
        }
        
        return results

    def _optimize_ensemble_weights(self, model_predictions: Dict, y_true: pd.Series):
        """Optimize ensemble weights using grid search"""
        from itertools import product
        
        best_mae = float('inf')
        best_weights = self.ensemble_weights.copy()
        
        # Grid search over weights (simplified)
        weight_options = [0.1, 0.2, 0.3, 0.4]
        
        for rf_w in weight_options:
            for xgb_w in weight_options:
                for gb_w in weight_options:
                    nn_w = 1.0 - rf_w - xgb_w - gb_w
                    if nn_w >= 0 and nn_w <= 1:
                        weights = {
                            'random_forest': rf_w,
                            'xgboost': xgb_w,
                            'gradient_boosting': gb_w,
                            'neural_network': nn_w
                        }
                        
                        # Calculate ensemble prediction
                        ensemble_pred = sum(
                            weights[name] * pred 
                            for name, pred in model_predictions.items()
                        )
                        
                        mae = mean_absolute_error(y_true, ensemble_pred)
                        if mae < best_mae:
                            best_mae = mae
                            best_weights = weights
        
        self.ensemble_weights = best_weights
        logger.info(f"Optimized ensemble weights: {best_weights}")

    def _ensemble_predict(self, model_predictions: Dict) -> np.ndarray:
        """Combine model predictions using ensemble weights"""
        return sum(
            self.ensemble_weights[name] * pred 
            for name, pred in model_predictions.items()
        )

    def predict(self, input_data: pd.DataFrame) -> np.ndarray:
        """Make demand predictions using the ensemble"""
        if not self.is_trained:
            raise ValueError("Models not trained. Call train() first.")
        
        X, _ = self.prepare_features(input_data)
        X_scaled = self.scaler.transform(X)
        X_scaled = pd.DataFrame(X_scaled, columns=X.columns)
        
        # Get predictions from all models
        model_predictions = {}
        for name, model in self.models.items():
            model_predictions[name] = model.predict(X_scaled)
        
        # Combine using ensemble weights
        ensemble_pred = self._ensemble_predict(model_predictions)
        
        return ensemble_pred

    def predict_with_confidence(self, input_data: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Make predictions with confidence intervals"""
        predictions = self.predict(input_data)
        
        # Calculate prediction variance from ensemble
        X, _ = self.prepare_features(input_data)
        X_scaled = self.scaler.transform(X)
        X_scaled = pd.DataFrame(X_scaled, columns=X.columns)
        
        model_preds = []
        for name, model in self.models.items():
            model_preds.append(model.predict(X_scaled))
        
        model_preds = np.array(model_preds)
        confidence = np.std(model_preds, axis=0)
        
        return predictions, confidence

    def feature_importance(self) -> Dict:
        """Get feature importance from tree-based models"""
        if not self.is_trained:
            raise ValueError("Models not trained. Call train() first.")
        
        importance_dict = {}
        
        for name, model in self.models.items():
            if hasattr(model, 'feature_importances_'):
                importance_dict[name] = dict(zip(
                    self.feature_columns, 
                    model.feature_importances_
                ))
        
        return importance_dict

    def save_model(self, filepath: str):
        """Save the trained ensemble model"""
        if not self.is_trained:
            raise ValueError("No trained model to save")
        
        model_data = {
            'models': self.models,
            'ensemble_weights': self.ensemble_weights,
            'scaler': self.scaler,
            'label_encoders': self.label_encoders,
            'feature_columns': self.feature_columns,
            'config': self.config
        }
        
        joblib.dump(model_data, filepath)
        logger.info(f"Model ensemble saved to {filepath}")

    def load_model(self, filepath: str):
        """Load a pre-trained ensemble model"""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file not found: {filepath}")
        
        model_data = joblib.load(filepath)
        
        self.models = model_data['models']
        self.ensemble_weights = model_data['ensemble_weights']
        self.scaler = model_data['scaler']
        self.label_encoders = model_data['label_encoders']
        self.feature_columns = model_data['feature_columns']
        self.config = model_data.get('config', self.config)
        self.is_trained = True
        
        logger.info(f"Model ensemble loaded from {filepath}")

# Example usage and API endpoint
if __name__ == "__main__":
    # Example usage
    predictor = AdvancedDemandPredictor()
    
    # Generate sample data for demonstration
    dates = pd.date_range(start='2024-01-01', end='2024-12-31', freq='H')
    sample_data = pd.DataFrame({
        'timestamp': dates,
        'demand': np.random.poisson(lam=15, size=len(dates)) + 
                 5 * np.sin(2 * np.pi * dates.hour / 24) +
                 3 * (dates.dayofweek >= 5).astype(int),
        'temperature': 20 + 10 * np.sin(2 * np.pi * dates.dayofyear / 365) + np.random.normal(0, 3, len(dates)),
        'humidity': 60 + 20 * np.random.random(len(dates)),
        'machine_count': 10,
        'student_population': 1000
    })
    
    # Train the model
    logger.info("Training advanced demand prediction model...")
    results = predictor.train(sample_data)
    
    # Make predictions
    future_data = sample_data.tail(100).copy()
    predictions = predictor.predict(future_data)
    predictions_with_conf, confidence = predictor.predict_with_confidence(future_data)
    
    logger.info(f"Sample predictions: {predictions[:5]}")
    logger.info(f"Feature importance: {predictor.feature_importance()}")
    
    # Save model
    predictor.save_model('models/advanced_demand_model.joblib')