import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
import logging
from datetime import datetime, timedelta
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LaundryDemandPredictor:
    """
    Machine learning model to predict laundry demand based on historical data,
    weather conditions, and seasonal patterns.
    """

    def __init__(self):
        self.model = None
        self.feature_columns = [
            'hour', 'day_of_week', 'month', 'is_weekend',
            'temperature', 'humidity', 'is_holiday',
            'historical_avg_3days', 'historical_avg_7days'
        ]

    def prepare_features(self, data):
        """Prepare features for model training/prediction"""
        # Time-based features
        data['hour'] = pd.to_datetime(data['timestamp']).dt.hour
        data['day_of_week'] = pd.to_datetime(data['timestamp']).dt.dayofweek
        data['month'] = pd.to_datetime(data['timestamp']).dt.month
        data['is_weekend'] = (data['day_of_week'] >= 5).astype(int)

        # Historical averages (simplified - in production, use proper time series features)
        data['historical_avg_3days'] = data['demand'].rolling(window=72, min_periods=1).mean()
        data['historical_avg_7days'] = data['demand'].rolling(window=168, min_periods=1).mean()

        # Weather features (mock data - in production, integrate with weather API)
        np.random.seed(42)
        data['temperature'] = np.random.normal(70, 15, len(data))
        data['humidity'] = np.random.normal(60, 20, len(data))

        # Holiday detection (simplified)
        data['is_holiday'] = 0  # Would be populated with actual holiday data

        return data[self.feature_columns]

    def train(self, training_data):
        """Train the demand prediction model"""
        logger.info("Starting model training...")

        # Prepare features
        X = self.prepare_features(training_data)
        y = training_data['demand']

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        # Train model
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )

        self.model.fit(X_train, y_train)

        # Evaluate
        train_pred = self.model.predict(X_train)
        test_pred = self.model.predict(X_test)

        train_mae = mean_absolute_error(y_train, train_pred)
        test_mae = mean_absolute_error(y_test, test_pred)

        logger.info(f"Training MAE: {train_mae:.2f}")
        logger.info(f"Testing MAE: {test_mae:.2f}")

        return {
            'train_mae': train_mae,
            'test_mae': test_mae,
            'feature_importance': dict(zip(self.feature_columns, self.model.feature_importances_))
        }

    def predict(self, input_data):
        """Make demand predictions"""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")

        X = self.prepare_features(input_data)
        predictions = self.model.predict(X)

        return predictions

    def save_model(self, filepath):
        """Save trained model to disk"""
        if self.model is None:
            raise ValueError("No model to save. Train model first.")

        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump(self.model, filepath)
        logger.info(f"Model saved to {filepath}")

    def load_model(self, filepath):
        """Load model from disk"""
        self.model = joblib.load(filepath)
        logger.info(f"Model loaded from {filepath}")

def generate_sample_data(days=30):
    """Generate sample training data"""
    start_date = datetime.now() - timedelta(days=days)
    timestamps = []
    demands = []

    for i in range(days * 24):  # Hourly data
        timestamp = start_date + timedelta(hours=i)

        # Simulate demand patterns
        hour = timestamp.hour
        day_of_week = timestamp.weekday()

        # Base demand with patterns
        base_demand = 20
        if 6 <= hour <= 10:  # Morning peak
            base_demand += 15
        elif 17 <= hour <= 21:  # Evening peak
            base_demand += 10
        elif hour >= 22 or hour <= 5:  # Night low
            base_demand -= 10

        if day_of_week >= 5:  # Weekend
            base_demand += 5

        # Add noise
        demand = max(0, base_demand + np.random.normal(0, 5))

        timestamps.append(timestamp)
        demands.append(demand)

    return pd.DataFrame({
        'timestamp': timestamps,
        'demand': demands
    })

if __name__ == "__main__":
    # Example usage
    logger.info("Generating sample data...")
    data = generate_sample_data(days=60)

    logger.info("Training demand prediction model...")
    predictor = LaundryDemandPredictor()
    metrics = predictor.train(data)

    logger.info("Model training completed!")
    logger.info(f"Metrics: {metrics}")

    # Save model
    model_path = "models/demand_predictor.joblib"
    predictor.save_model(model_path)

    # Example prediction
    future_data = generate_sample_data(days=7)
    predictions = predictor.predict(future_data)

    logger.info(f"Predicted demand for next 7 days: {predictions[:24]}")  # First 24 hours
