"""
Federated Learning Implementation for Smart Laundry System
Enables decentralized machine learning across multiple laundry facilities
while preserving data privacy and improving global models.
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import numpy as np
import json
import pickle
import hashlib
import time
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from collections import OrderedDict
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class FederatedConfig:
    """Configuration for federated learning parameters"""
    num_rounds: int = 10
    num_clients: int = 5
    local_epochs: int = 5
    learning_rate: float = 0.01
    batch_size: int = 32
    min_clients: int = 3
    privacy_budget: float = 1.0
    noise_multiplier: float = 0.1
    max_grad_norm: float = 1.0

class LaundryUsageDataset(Dataset):
    """Dataset for laundry usage patterns"""

    def __init__(self, data: np.ndarray, labels: np.ndarray):
        self.data = torch.FloatTensor(data)
        self.labels = torch.LongTensor(labels)

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        return self.data[idx], self.labels[idx]

class LaundryPredictionModel(nn.Module):
    """Neural network model for laundry demand prediction"""

    def __init__(self, input_size: int = 24, hidden_size: int = 128, num_classes: int = 3):
        super(LaundryPredictionModel, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size // 2, num_classes)
        )

    def forward(self, x):
        return self.network(x)

class PrivacyEngine:
    """Differential privacy implementation for federated learning"""

    def __init__(self, noise_multiplier: float = 0.1, max_grad_norm: float = 1.0):
        self.noise_multiplier = noise_multiplier
        self.max_grad_norm = max_grad_norm

    def add_noise_to_gradients(self, model: nn.Module):
        """Add calibrated noise to model gradients"""
        total_norm = 0.0

        # Calculate gradient norm
        for param in model.parameters():
            if param.grad is not None:
                param_norm = param.grad.data.norm(2)
                total_norm += param_norm.item() ** 2
        total_norm = total_norm ** (1. / 2)

        # Clip gradients
        clip_coef = self.max_grad_norm / (total_norm + 1e-6)
        if clip_coef < 1:
            for param in model.parameters():
                if param.grad is not None:
                    param.grad.data.mul_(clip_coef)

        # Add noise
        for param in model.parameters():
            if param.grad is not None:
                noise = torch.normal(
                    mean=0.0,
                    std=self.noise_multiplier * self.max_grad_norm,
                    size=param.grad.shape
                )
                param.grad.data.add_(noise)

class FederatedClient:
    """Individual client in federated learning setup"""

    def __init__(self, client_id: str, data: np.ndarray, labels: np.ndarray, config: FederatedConfig):
        self.client_id = client_id
        self.config = config
        self.dataset = LaundryUsageDataset(data, labels)
        self.dataloader = DataLoader(
            self.dataset,
            batch_size=config.batch_size,
            shuffle=True
        )
        self.model = None
        self.privacy_engine = PrivacyEngine(
            noise_multiplier=config.noise_multiplier,
            max_grad_norm=config.max_grad_norm
        )

    def set_model(self, model: nn.Module):
        """Set the global model for local training"""
        self.model = model

    def local_train(self) -> Dict:
        """Perform local training and return model updates"""
        if self.model is None:
            raise ValueError("Model not set for client")

        self.model.train()
        optimizer = optim.SGD(self.model.parameters(), lr=self.config.learning_rate)
        criterion = nn.CrossEntropyLoss()

        initial_state = {k: v.clone() for k, v in self.model.state_dict().items()}

        total_loss = 0.0
        num_batches = 0

        for epoch in range(self.config.local_epochs):
            for batch_data, batch_labels in self.dataloader:
                optimizer.zero_grad()
                outputs = self.model(batch_data)
                loss = criterion(outputs, batch_labels)
                loss.backward()

                # Apply differential privacy
                self.privacy_engine.add_noise_to_gradients(self.model)

                optimizer.step()
                total_loss += loss.item()
                num_batches += 1

        # Calculate model updates (difference from initial state)
        updates = {}
        for key in initial_state:
            updates[key] = self.model.state_dict()[key] - initial_state[key]

        return {
            'client_id': self.client_id,
            'updates': updates,
            'num_samples': len(self.dataset),
            'loss': total_loss / num_batches if num_batches > 0 else 0.0
        }

    def evaluate(self) -> Dict:
        """Evaluate model on local data"""
        if self.model is None:
            raise ValueError("Model not set for client")

        self.model.eval()
        correct = 0
        total = 0
        total_loss = 0.0
        criterion = nn.CrossEntropyLoss()

        with torch.no_grad():
            for batch_data, batch_labels in self.dataloader:
                outputs = self.model(batch_data)
                loss = criterion(outputs, batch_labels)
                total_loss += loss.item()

                _, predicted = torch.max(outputs.data, 1)
                total += batch_labels.size(0)
                correct += (predicted == batch_labels).sum().item()

        return {
            'accuracy': correct / total if total > 0 else 0.0,
            'loss': total_loss / len(self.dataloader) if len(self.dataloader) > 0 else 0.0,
            'num_samples': len(self.dataset)
        }

class FederatedServer:
    """Central server for federated learning coordination"""

    def __init__(self, model: nn.Module, config: FederatedConfig):
        self.global_model = model
        self.config = config
        self.clients: List[FederatedClient] = []
        self.round_results: List[Dict] = []

    def add_client(self, client: FederatedClient):
        """Add a client to the federation"""
        self.clients.append(client)
        logger.info(f"Added client {client.client_id} to federation")

    def select_clients(self, fraction: float = 1.0) -> List[FederatedClient]:
        """Select subset of clients for training round"""
        num_selected = max(1, int(len(self.clients) * fraction))
        selected = np.random.choice(self.clients, num_selected, replace=False)
        return selected.tolist()

    def aggregate_updates(self, client_updates: List[Dict]) -> None:
        """Aggregate client updates using FedAvg algorithm"""
        if not client_updates:
            return

        # Calculate total samples for weighted averaging
        total_samples = sum(update['num_samples'] for update in client_updates)

        # Initialize aggregated updates
        aggregated_updates = {}
        for key in client_updates[0]['updates']:
            aggregated_updates[key] = torch.zeros_like(client_updates[0]['updates'][key])

        # Weighted averaging
        for update in client_updates:
            weight = update['num_samples'] / total_samples
            for key in aggregated_updates:
                aggregated_updates[key] += weight * update['updates'][key]

        # Apply updates to global model
        global_state = self.global_model.state_dict()
        for key in aggregated_updates:
            global_state[key] += aggregated_updates[key]

        self.global_model.load_state_dict(global_state)

    def federated_round(self) -> Dict:
        """Execute one round of federated learning"""
        logger.info(f"Starting federated learning round")

        # Select clients for this round
        selected_clients = self.select_clients()

        if len(selected_clients) < self.config.min_clients:
            logger.warning(f"Insufficient clients: {len(selected_clients)} < {self.config.min_clients}")
            return {'status': 'insufficient_clients', 'client_count': len(selected_clients)}

        # Send global model to selected clients
        client_updates = []
        client_evaluations = []

        for client in selected_clients:
            # Clone global model for client
            client_model = LaundryPredictionModel(
                input_size=self.global_model.network[0].in_features,
                hidden_size=128,
                num_classes=self.global_model.network[-1].out_features
            )
            client_model.load_state_dict(self.global_model.state_dict())
            client.set_model(client_model)

            # Perform local training
            try:
                update_result = client.local_train()
                client_updates.append(update_result)

                # Evaluate on local data
                eval_result = client.evaluate()
                eval_result['client_id'] = client.client_id
                client_evaluations.append(eval_result)

                logger.info(f"Client {client.client_id}: Loss={update_result['loss']:.4f}, "
                          f"Accuracy={eval_result['accuracy']:.4f}")

            except Exception as e:
                logger.error(f"Error training client {client.client_id}: {str(e)}")
                continue

        # Aggregate updates
        if client_updates:
            self.aggregate_updates(client_updates)

        # Calculate round statistics
        avg_loss = np.mean([update['loss'] for update in client_updates]) if client_updates else 0.0
        avg_accuracy = np.mean([eval['accuracy'] for eval in client_evaluations]) if client_evaluations else 0.0

        round_result = {
            'status': 'completed',
            'participating_clients': len(client_updates),
            'avg_loss': avg_loss,
            'avg_accuracy': avg_accuracy,
            'client_evaluations': client_evaluations
        }

        self.round_results.append(round_result)
        return round_result

    def train(self) -> Dict:
        """Execute complete federated learning training"""
        logger.info(f"Starting federated learning with {len(self.clients)} clients for {self.config.num_rounds} rounds")

        training_history = {
            'rounds': [],
            'final_accuracy': 0.0,
            'convergence_round': -1
        }

        best_accuracy = 0.0
        convergence_threshold = 0.001
        patience = 3
        no_improvement_count = 0

        for round_num in range(self.config.num_rounds):
            logger.info(f"=== Round {round_num + 1}/{self.config.num_rounds} ===")

            round_result = self.federated_round()
            round_result['round'] = round_num + 1
            training_history['rounds'].append(round_result)

            if round_result['status'] == 'completed':
                current_accuracy = round_result['avg_accuracy']

                # Check for convergence
                if current_accuracy > best_accuracy + convergence_threshold:
                    best_accuracy = current_accuracy
                    no_improvement_count = 0
                else:
                    no_improvement_count += 1

                # Early stopping
                if no_improvement_count >= patience:
                    logger.info(f"Early stopping at round {round_num + 1} due to convergence")
                    training_history['convergence_round'] = round_num + 1
                    break

        training_history['final_accuracy'] = best_accuracy

        logger.info(f"Federated training completed. Final accuracy: {best_accuracy:.4f}")
        return training_history

class FederatedLearningCoordinator:
    """High-level coordinator for federated learning operations"""

    def __init__(self, config: FederatedConfig):
        self.config = config
        self.server = None
        self.model_registry = {}

    def create_synthetic_data(self, num_facilities: int = 5) -> List[Tuple[np.ndarray, np.ndarray]]:
        """Generate synthetic laundry usage data for multiple facilities"""
        facility_data = []

        for facility_id in range(num_facilities):
            # Each facility has different usage patterns
            np.random.seed(facility_id * 42)  # Consistent but different seeds

            # Time-based features (hour of day, day of week, month)
            num_samples = 1000 + np.random.randint(0, 500)  # 1000-1500 samples per facility

            # Generate features: [hour, day_of_week, month, weather_temp, holiday, occupancy, ...]
            hours = np.random.randint(0, 24, num_samples)
            days = np.random.randint(0, 7, num_samples)
            months = np.random.randint(1, 13, num_samples)
            temperatures = np.random.normal(20 + facility_id, 5, num_samples)  # Different climate per facility
            holidays = np.random.binomial(1, 0.1, num_samples)
            occupancy = np.random.normal(50 + facility_id * 10, 15, num_samples)

            # Facility-specific patterns
            weekend_factor = np.where(days >= 5, 1.5, 1.0)
            evening_factor = np.where((hours >= 18) | (hours <= 6), 1.3, 1.0)
            holiday_factor = np.where(holidays == 1, 0.7, 1.0)

            # Additional features
            laundromat_size = np.full(num_samples, facility_id + 1)
            location_type = np.full(num_samples, facility_id % 3)  # 0: urban, 1: suburban, 2: rural

            # Combine features
            features = np.column_stack([
                hours, days, months, temperatures, holidays, occupancy,
                weekend_factor, evening_factor, holiday_factor,
                laundromat_size, location_type
            ])

            # Pad to 24 features if needed
            if features.shape[1] < 24:
                padding = np.random.normal(0, 0.1, (num_samples, 24 - features.shape[1]))
                features = np.column_stack([features, padding])

            # Generate labels: 0=low demand, 1=medium demand, 2=high demand
            demand_score = (
                0.3 * weekend_factor +
                0.2 * evening_factor +
                0.1 * holiday_factor +
                0.2 * (occupancy / 100) +
                0.2 * np.random.normal(0, 0.1, num_samples)
            )

            labels = np.digitize(demand_score, bins=[0.3, 0.7, 1.0])
            labels = np.clip(labels, 0, 2)

            facility_data.append((features, labels))
            logger.info(f"Generated {num_samples} samples for facility {facility_id}")

        return facility_data

    def setup_federation(self, facility_data: List[Tuple[np.ndarray, np.ndarray]]) -> FederatedServer:
        """Setup federated learning server and clients"""
        # Create global model
        global_model = LaundryPredictionModel(input_size=24, hidden_size=128, num_classes=3)

        # Create server
        self.server = FederatedServer(global_model, self.config)

        # Create clients for each facility
        for i, (data, labels) in enumerate(facility_data):
            client = FederatedClient(f"facility_{i}", data, labels, self.config)
            self.server.add_client(client)

        return self.server

    def save_model(self, filepath: str, metadata: Dict = None):
        """Save the trained global model"""
        if self.server is None:
            raise ValueError("No trained model to save")

        save_data = {
            'model_state_dict': self.server.global_model.state_dict(),
            'config': self.config.__dict__,
            'metadata': metadata or {},
            'timestamp': time.time()
        }

        with open(filepath, 'wb') as f:
            pickle.dump(save_data, f)

        logger.info(f"Model saved to {filepath}")

    def load_model(self, filepath: str) -> LaundryPredictionModel:
        """Load a trained model"""
        with open(filepath, 'rb') as f:
            save_data = pickle.load(f)

        model = LaundryPredictionModel(input_size=24, hidden_size=128, num_classes=3)
        model.load_state_dict(save_data['model_state_dict'])

        logger.info(f"Model loaded from {filepath}")
        return model

    def run_federated_learning(self) -> Dict:
        """Execute complete federated learning pipeline"""
        logger.info("Starting federated learning pipeline")

        # Generate synthetic data for facilities
        facility_data = self.create_synthetic_data(num_facilities=self.config.num_clients)

        # Setup federation
        server = self.setup_federation(facility_data)

        # Train the model
        training_history = server.train()

        # Save the trained model
        model_path = f"models/federated_model_{int(time.time())}.pkl"
        Path("models").mkdir(exist_ok=True)

        metadata = {
            'num_clients': len(server.clients),
            'training_rounds': len(training_history['rounds']),
            'final_accuracy': training_history['final_accuracy']
        }

        self.save_model(model_path, metadata)

        return {
            'training_history': training_history,
            'model_path': model_path,
            'federation_stats': {
                'num_clients': len(server.clients),
                'total_samples': sum(len(client.dataset) for client in server.clients)
            }
        }

def main():
    """Main function to run federated learning"""
    # Configuration
    config = FederatedConfig(
        num_rounds=15,
        num_clients=5,
        local_epochs=3,
        learning_rate=0.01,
        batch_size=32,
        min_clients=3,
        privacy_budget=1.0,
        noise_multiplier=0.1,
        max_grad_norm=1.0
    )

    # Initialize coordinator
    coordinator = FederatedLearningCoordinator(config)

    # Run federated learning
    results = coordinator.run_federated_learning()

    # Print results
    print("\n" + "="*50)
    print("FEDERATED LEARNING RESULTS")
    print("="*50)
    print(f"Training Rounds: {len(results['training_history']['rounds'])}")
    print(f"Final Accuracy: {results['training_history']['final_accuracy']:.4f}")
    print(f"Model Path: {results['model_path']}")
    print(f"Total Clients: {results['federation_stats']['num_clients']}")
    print(f"Total Samples: {results['federation_stats']['total_samples']}")

    if results['training_history']['convergence_round'] > 0:
        print(f"Converged at Round: {results['training_history']['convergence_round']}")

    print("\nPer-Round Results:")
    for round_result in results['training_history']['rounds']:
        if round_result['status'] == 'completed':
            print(f"Round {round_result['round']}: "
                  f"Accuracy={round_result['avg_accuracy']:.4f}, "
                  f"Loss={round_result['avg_loss']:.4f}, "
                  f"Clients={round_result['participating_clients']}")

if __name__ == "__main__":
    main()
