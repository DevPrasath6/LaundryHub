import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet50 import preprocess_input
import logging
import os
from typing import List, Dict, Tuple
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LostItemMatcher:
    """
    Computer vision system for matching lost items using deep learning
    """

    def __init__(self, model_path=None):
        self.feature_extractor = None
        self.item_database = {}
        self.load_feature_extractor()

        if model_path and os.path.exists(model_path):
            self.load_database(model_path)

    def load_feature_extractor(self):
        """Load pre-trained ResNet50 for feature extraction"""
        logger.info("Loading feature extraction model...")
        self.feature_extractor = ResNet50(
            weights='imagenet',
            include_top=False,
            pooling='avg',
            input_shape=(224, 224, 3)
        )
        logger.info("Feature extractor loaded successfully")

    def preprocess_image(self, image_path: str) -> np.ndarray:
        """Preprocess image for feature extraction"""
        try:
            img = image.load_img(image_path, target_size=(224, 224))
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = preprocess_input(img_array)
            return img_array
        except Exception as e:
            logger.error(f"Error preprocessing image {image_path}: {e}")
            return None

    def extract_features(self, image_path: str) -> np.ndarray:
        """Extract features from an image"""
        preprocessed_img = self.preprocess_image(image_path)
        if preprocessed_img is None:
            return None

        features = self.feature_extractor.predict(preprocessed_img, verbose=0)
        return features.flatten()

    def add_lost_item(self, item_id: str, image_path: str, metadata: Dict):
        """Add a lost item to the database"""
        logger.info(f"Adding lost item {item_id} to database...")

        features = self.extract_features(image_path)
        if features is None:
            logger.error(f"Failed to extract features for item {item_id}")
            return False

        self.item_database[item_id] = {
            'features': features.tolist(),
            'image_path': image_path,
            'metadata': metadata,
            'status': 'lost'
        }

        logger.info(f"Item {item_id} added successfully")
        return True

    def add_found_item(self, item_id: str, image_path: str, metadata: Dict):
        """Add a found item to the database"""
        logger.info(f"Adding found item {item_id} to database...")

        features = self.extract_features(image_path)
        if features is None:
            logger.error(f"Failed to extract features for item {item_id}")
            return False

        self.item_database[item_id] = {
            'features': features.tolist(),
            'image_path': image_path,
            'metadata': metadata,
            'status': 'found'
        }

        logger.info(f"Found item {item_id} added successfully")
        return True

    def calculate_similarity(self, features1: np.ndarray, features2: np.ndarray) -> float:
        """Calculate cosine similarity between two feature vectors"""
        # Normalize features
        norm1 = np.linalg.norm(features1)
        norm2 = np.linalg.norm(features2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        normalized1 = features1 / norm1
        normalized2 = features2 / norm2

        # Calculate cosine similarity
        similarity = np.dot(normalized1, normalized2)
        return float(similarity)

    def find_matches(self, query_item_id: str, threshold: float = 0.8) -> List[Dict]:
        """Find potential matches for a given item"""
        if query_item_id not in self.item_database:
            logger.error(f"Item {query_item_id} not found in database")
            return []

        query_item = self.item_database[query_item_id]
        query_features = np.array(query_item['features'])
        query_status = query_item['status']

        # Look for items with opposite status (lost items match with found items)
        target_status = 'found' if query_status == 'lost' else 'lost'

        matches = []
        for item_id, item_data in self.item_database.items():
            if item_id == query_item_id or item_data['status'] != target_status:
                continue

            item_features = np.array(item_data['features'])
            similarity = self.calculate_similarity(query_features, item_features)

            if similarity >= threshold:
                matches.append({
                    'item_id': item_id,
                    'similarity': similarity,
                    'metadata': item_data['metadata'],
                    'image_path': item_data['image_path']
                })

        # Sort by similarity (highest first)
        matches.sort(key=lambda x: x['similarity'], reverse=True)

        logger.info(f"Found {len(matches)} potential matches for item {query_item_id}")
        return matches

    def save_database(self, filepath: str):
        """Save the item database to disk"""
        try:
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, 'w') as f:
                json.dump(self.item_database, f, indent=2)
            logger.info(f"Database saved to {filepath}")
            return True
        except Exception as e:
            logger.error(f"Error saving database: {e}")
            return False

    def load_database(self, filepath: str):
        """Load the item database from disk"""
        try:
            with open(filepath, 'r') as f:
                self.item_database = json.load(f)
            logger.info(f"Database loaded from {filepath}")
            return True
        except Exception as e:
            logger.error(f"Error loading database: {e}")
            return False

    def get_statistics(self) -> Dict:
        """Get database statistics"""
        total_items = len(self.item_database)
        lost_items = sum(1 for item in self.item_database.values() if item['status'] == 'lost')
        found_items = sum(1 for item in self.item_database.values() if item['status'] == 'found')

        return {
            'total_items': total_items,
            'lost_items': lost_items,
            'found_items': found_items
        }

def create_sample_metadata():
    """Create sample metadata for testing"""
    return {
        'description': 'Blue cotton t-shirt',
        'color': 'blue',
        'type': 'clothing',
        'size': 'medium',
        'brand': 'unknown',
        'reporter_name': 'John Doe',
        'reporter_contact': 'john@example.com',
        'location_found': 'Washing machine #3',
        'date_reported': '2023-10-01'
    }

if __name__ == "__main__":
    # Example usage
    matcher = LostItemMatcher()

    # Note: In a real implementation, you would have actual image files
    logger.info("Lost item matching system initialized")
    logger.info("Ready to process lost and found items")

    # Example workflow:
    # 1. matcher.add_lost_item("lost_001", "path/to/lost_item.jpg", metadata)
    # 2. matcher.add_found_item("found_001", "path/to/found_item.jpg", metadata)
    # 3. matches = matcher.find_matches("lost_001")
    # 4. matcher.save_database("database/items.json")

    stats = matcher.get_statistics()
    logger.info(f"Database statistics: {stats}")
