import cv2
import numpy as np
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision import models
import pickle
import logging
from typing import Dict, List, Tuple, Optional
import os
import json
from datetime import datetime
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import DBSCAN
import hashlib
import base64
from PIL import Image
import io

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ClothingFeatureExtractor(nn.Module):
    """
    Advanced neural network for extracting features from clothing images
    using transfer learning with ResNet50 and custom layers for clothing-specific features
    """
    
    def __init__(self, num_features=512):
        super(ClothingFeatureExtractor, self).__init__()
        
        # Load pre-trained ResNet50
        self.backbone = models.resnet50(pretrained=True)
        
        # Remove the final classification layer
        self.backbone = nn.Sequential(*list(self.backbone.children())[:-1])
        
        # Freeze backbone parameters for transfer learning
        for param in self.backbone.parameters():
            param.requires_grad = False
        
        # Custom feature extraction layers
        self.feature_extractor = nn.Sequential(
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten(),
            nn.Linear(2048, 1024),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(1024, num_features),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(num_features, num_features)
        )
        
        # Color feature extraction
        self.color_extractor = nn.Sequential(
            nn.Linear(num_features, 256),
            nn.ReLU(),
            nn.Linear(256, 64)  # Color features
        )
        
        # Texture feature extraction
        self.texture_extractor = nn.Sequential(
            nn.Linear(num_features, 256),
            nn.ReLU(),
            nn.Linear(256, 64)  # Texture features
        )
        
        # Pattern feature extraction
        self.pattern_extractor = nn.Sequential(
            nn.Linear(num_features, 256),
            nn.ReLU(),
            nn.Linear(256, 32)  # Pattern features
        )
    
    def forward(self, x):
        # Extract backbone features
        backbone_features = self.backbone(x)
        base_features = self.feature_extractor(backbone_features)
        
        # Extract specialized features
        color_features = self.color_extractor(base_features)
        texture_features = self.texture_extractor(base_features)
        pattern_features = self.pattern_extractor(base_features)
        
        # Combine all features
        combined_features = torch.cat([
            base_features,
            color_features,
            texture_features,
            pattern_features
        ], dim=1)
        
        return combined_features

class ColorAnalyzer:
    """Extract and analyze color features from clothing images"""
    
    def __init__(self):
        self.color_names = {
            'red': ([0, 0, 100], [10, 255, 255]),
            'orange': ([11, 100, 100], [25, 255, 255]),
            'yellow': ([26, 100, 100], [35, 255, 255]),
            'green': ([36, 100, 100], [70, 255, 255]),
            'blue': ([100, 100, 100], [130, 255, 255]),
            'purple': ([131, 100, 100], [160, 255, 255]),
            'pink': ([161, 100, 100], [179, 255, 255]),
            'white': ([0, 0, 200], [180, 30, 255]),
            'black': ([0, 0, 0], [180, 255, 50]),
            'gray': ([0, 0, 51], [180, 30, 199]),
            'brown': ([8, 50, 20], [20, 255, 200])
        }
    
    def extract_dominant_colors(self, image: np.ndarray, k: int = 5) -> List[Tuple[str, float]]:
        """Extract dominant colors from image using K-means clustering"""
        # Convert to RGB
        if len(image.shape) == 3:
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        else:
            image_rgb = image
        
        # Reshape image to be a list of pixels
        pixels = image_rgb.reshape((-1, 3))
        
        # Apply K-means clustering
        from sklearn.cluster import KMeans
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        kmeans.fit(pixels)
        
        # Get colors and their percentages
        colors = kmeans.cluster_centers_
        labels = kmeans.labels_
        
        color_percentages = []
        for i in range(k):
            percentage = np.sum(labels == i) / len(labels)
            color_name = self._get_color_name(colors[i])
            color_percentages.append((color_name, percentage))
        
        # Sort by percentage
        color_percentages.sort(key=lambda x: x[1], reverse=True)
        return color_percentages
    
    def _get_color_name(self, rgb_color: np.ndarray) -> str:
        """Convert RGB color to color name"""
        # Convert RGB to HSV for better color matching
        rgb_normalized = rgb_color.reshape(1, 1, 3).astype(np.uint8)
        hsv = cv2.cvtColor(rgb_normalized, cv2.COLOR_RGB2HSV)[0, 0]
        
        min_distance = float('inf')
        closest_color = 'unknown'
        
        for color_name, (lower, upper) in self.color_names.items():
            lower = np.array(lower)
            upper = np.array(upper)
            
            # Check if HSV values are within range
            if np.all(hsv >= lower) and np.all(hsv <= upper):
                return color_name
        
        return 'unknown'

class TextureAnalyzer:
    """Extract texture features using Local Binary Patterns and Gabor filters"""
    
    def __init__(self):
        self.gabor_filters = self._create_gabor_filters()
    
    def _create_gabor_filters(self) -> List[np.ndarray]:
        """Create a bank of Gabor filters for texture analysis"""
        filters = []
        for theta in range(0, 180, 30):  # 6 orientations
            for frequency in [0.1, 0.3, 0.5]:  # 3 frequencies
                kernel = cv2.getGaborKernel((21, 21), 5, np.radians(theta), 2*np.pi*frequency, 0.5, 0, ktype=cv2.CV_32F)
                filters.append(kernel)
        return filters
    
    def extract_lbp_features(self, image: np.ndarray) -> np.ndarray:
        """Extract Local Binary Pattern features"""
        # Convert to grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Calculate LBP
        radius = 3
        n_points = 8 * radius
        
        lbp = np.zeros_like(gray)
        
        for i in range(radius, gray.shape[0] - radius):
            for j in range(radius, gray.shape[1] - radius):
                center = gray[i, j]
                binary_string = ""
                
                for p in range(n_points):
                    angle = 2 * np.pi * p / n_points
                    x = i + radius * np.cos(angle)
                    y = j + radius * np.sin(angle)
                    
                    # Bilinear interpolation
                    x1, y1 = int(x), int(y)
                    x2, y2 = x1 + 1, y1 + 1
                    
                    if x2 < gray.shape[0] and y2 < gray.shape[1]:
                        value = (gray[x1, y1] * (x2 - x) * (y2 - y) +
                                gray[x2, y1] * (x - x1) * (y2 - y) +
                                gray[x1, y2] * (x2 - x) * (y - y1) +
                                gray[x2, y2] * (x - x1) * (y - y1))
                        
                        binary_string += "1" if value >= center else "0"
                
                lbp[i, j] = int(binary_string, 2)
        
        # Calculate histogram
        hist, _ = np.histogram(lbp.ravel(), bins=256, range=(0, 256))
        return hist / np.sum(hist)  # Normalize
    
    def extract_gabor_features(self, image: np.ndarray) -> np.ndarray:
        """Extract Gabor filter responses"""
        # Convert to grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        features = []
        for kernel in self.gabor_filters:
            response = cv2.filter2D(gray, cv2.CV_8UC3, kernel)
            features.extend([np.mean(response), np.std(response)])
        
        return np.array(features)

class AdvancedItemMatcher:
    """
    Advanced lost and found item matching system using deep learning,
    computer vision, and multi-modal feature fusion
    """
    
    def __init__(self, model_path: Optional[str] = None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")
        
        # Initialize components
        self.feature_extractor = ClothingFeatureExtractor().to(self.device)
        self.color_analyzer = ColorAnalyzer()
        self.texture_analyzer = TextureAnalyzer()
        
        # Load pre-trained model if available
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        
        # Database of item features
        self.item_database = {}
        self.feature_database = {}
        
        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    
    def preprocess_image(self, image_input) -> torch.Tensor:
        """Preprocess image for feature extraction"""
        if isinstance(image_input, str):
            # Load image from path
            image = Image.open(image_input).convert('RGB')
        elif isinstance(image_input, np.ndarray):
            # Convert numpy array to PIL Image
            image = Image.fromarray(cv2.cvtColor(image_input, cv2.COLOR_BGR2RGB))
        elif isinstance(image_input, bytes):
            # Decode base64 image
            image = Image.open(io.BytesIO(image_input)).convert('RGB')
        else:
            image = image_input
        
        return self.transform(image).unsqueeze(0).to(self.device)
    
    def extract_comprehensive_features(self, image_input) -> Dict:
        """Extract comprehensive features from an item image"""
        # Convert to numpy array for traditional CV methods
        if isinstance(image_input, str):
            cv_image = cv2.imread(image_input)
        elif isinstance(image_input, bytes):
            nparr = np.frombuffer(image_input, np.uint8)
            cv_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        else:
            cv_image = image_input
        
        # Deep learning features
        torch_image = self.preprocess_image(image_input)
        
        with torch.no_grad():
            deep_features = self.feature_extractor(torch_image).cpu().numpy().flatten()
        
        # Color features
        dominant_colors = self.color_analyzer.extract_dominant_colors(cv_image)
        color_vector = self._colors_to_vector(dominant_colors)
        
        # Texture features
        lbp_features = self.texture_analyzer.extract_lbp_features(cv_image)
        gabor_features = self.texture_analyzer.extract_gabor_features(cv_image)
        
        # Shape features using contours
        shape_features = self._extract_shape_features(cv_image)
        
        # Combine all features
        combined_features = np.concatenate([
            deep_features,
            color_vector,
            lbp_features,
            gabor_features,
            shape_features
        ])
        
        return {
            'combined_features': combined_features,
            'deep_features': deep_features,
            'color_features': color_vector,
            'texture_features': np.concatenate([lbp_features, gabor_features]),
            'shape_features': shape_features,
            'dominant_colors': dominant_colors,
            'feature_hash': hashlib.md5(combined_features.tobytes()).hexdigest()
        }
    
    def _colors_to_vector(self, dominant_colors: List[Tuple[str, float]]) -> np.ndarray:
        """Convert dominant colors to feature vector"""
        color_dict = {
            'red': 0, 'orange': 1, 'yellow': 2, 'green': 3, 'blue': 4,
            'purple': 5, 'pink': 6, 'white': 7, 'black': 8, 'gray': 9, 'brown': 10
        }
        
        vector = np.zeros(len(color_dict))
        for color_name, percentage in dominant_colors:
            if color_name in color_dict:
                vector[color_dict[color_name]] = percentage
        
        return vector
    
    def _extract_shape_features(self, image: np.ndarray) -> np.ndarray:
        """Extract shape features using contour analysis"""
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Edge detection
        edges = cv2.Canny(gray, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return np.zeros(10)  # Return zero features if no contours found
        
        # Get the largest contour (assumed to be the main item)
        largest_contour = max(contours, key=cv2.contourArea)
        
        # Calculate shape features
        area = cv2.contourArea(largest_contour)
        perimeter = cv2.arcLength(largest_contour, True)
        
        # Aspect ratio
        x, y, w, h = cv2.boundingRect(largest_contour)
        aspect_ratio = float(w) / h if h != 0 else 0
        
        # Extent (ratio of contour area to bounding rectangle area)
        rect_area = w * h
        extent = float(area) / rect_area if rect_area != 0 else 0
        
        # Solidity (ratio of contour area to convex hull area)
        hull = cv2.convexHull(largest_contour)
        hull_area = cv2.contourArea(hull)
        solidity = float(area) / hull_area if hull_area != 0 else 0
        
        # Circularity
        circularity = 4 * np.pi * area / (perimeter * perimeter) if perimeter != 0 else 0
        
        # Hu moments
        moments = cv2.moments(largest_contour)
        hu_moments = cv2.HuMoments(moments).flatten()
        
        # Combine shape features
        shape_features = np.array([
            area / 10000,  # Normalized area
            perimeter / 1000,  # Normalized perimeter
            aspect_ratio,
            extent,
            solidity,
            circularity,
            *hu_moments[:4]  # First 4 Hu moments
        ])
        
        return shape_features
    
    def add_item_to_database(self, item_id: str, image_input, metadata: Dict) -> Dict:
        """Add a lost or found item to the database"""
        try:
            # Extract features
            features = self.extract_comprehensive_features(image_input)
            
            # Store in database
            self.item_database[item_id] = {
                'metadata': metadata,
                'timestamp': datetime.now().isoformat(),
                'features': features,
                'status': metadata.get('status', 'lost')  # 'lost' or 'found'
            }
            
            self.feature_database[item_id] = features['combined_features']
            
            logger.info(f"Added item {item_id} to database")
            
            return {
                'success': True,
                'item_id': item_id,
                'feature_hash': features['feature_hash']
            }
            
        except Exception as e:
            logger.error(f"Error adding item to database: {e}")
            return {'success': False, 'error': str(e)}
    
    def find_matches(self, query_image, threshold: float = 0.8, max_matches: int = 10) -> List[Dict]:
        """Find matching items in the database"""
        try:
            # Extract features from query image
            query_features = self.extract_comprehensive_features(query_image)
            query_vector = query_features['combined_features'].reshape(1, -1)
            
            # Calculate similarities with all items in database
            similarities = []
            
            for item_id, stored_vector in self.feature_database.items():
                stored_vector = stored_vector.reshape(1, -1)
                
                # Calculate cosine similarity
                similarity = cosine_similarity(query_vector, stored_vector)[0, 0]
                
                # Calculate weighted similarity using different feature types
                item_data = self.item_database[item_id]
                stored_features = item_data['features']
                
                # Deep learning features (weight: 0.4)
                deep_sim = cosine_similarity(
                    query_features['deep_features'].reshape(1, -1),
                    stored_features['deep_features'].reshape(1, -1)
                )[0, 0]
                
                # Color features (weight: 0.3)
                color_sim = cosine_similarity(
                    query_features['color_features'].reshape(1, -1),
                    stored_features['color_features'].reshape(1, -1)
                )[0, 0]
                
                # Texture features (weight: 0.2)
                texture_sim = cosine_similarity(
                    query_features['texture_features'].reshape(1, -1),
                    stored_features['texture_features'].reshape(1, -1)
                )[0, 0]
                
                # Shape features (weight: 0.1)
                shape_sim = cosine_similarity(
                    query_features['shape_features'].reshape(1, -1),
                    stored_features['shape_features'].reshape(1, -1)
                )[0, 0]
                
                # Weighted similarity
                weighted_similarity = (
                    0.4 * deep_sim +
                    0.3 * color_sim +
                    0.2 * texture_sim +
                    0.1 * shape_sim
                )
                
                similarities.append({
                    'item_id': item_id,
                    'similarity': weighted_similarity,
                    'cosine_similarity': similarity,
                    'deep_similarity': deep_sim,
                    'color_similarity': color_sim,
                    'texture_similarity': texture_sim,
                    'shape_similarity': shape_sim,
                    'metadata': item_data['metadata'],
                    'timestamp': item_data['timestamp']
                })
            
            # Sort by similarity and filter by threshold
            similarities.sort(key=lambda x: x['similarity'], reverse=True)
            matches = [match for match in similarities if match['similarity'] >= threshold]
            
            return matches[:max_matches]
            
        except Exception as e:
            logger.error(f"Error finding matches: {e}")
            return []
    
    def smart_clustering_analysis(self, threshold: float = 0.9) -> Dict:
        """Perform clustering analysis to find potential duplicate items"""
        if len(self.feature_database) < 2:
            return {'clusters': [], 'potential_duplicates': []}
        
        # Prepare feature matrix
        item_ids = list(self.feature_database.keys())
        features_matrix = np.array([self.feature_database[item_id] for item_id in item_ids])
        
        # Perform DBSCAN clustering
        clustering = DBSCAN(eps=1-threshold, min_samples=2, metric='cosine')
        cluster_labels = clustering.fit_predict(features_matrix)
        
        # Group items by clusters
        clusters = {}
        potential_duplicates = []
        
        for i, label in enumerate(cluster_labels):
            if label != -1:  # Not noise
                if label not in clusters:
                    clusters[label] = []
                clusters[label].append({
                    'item_id': item_ids[i],
                    'metadata': self.item_database[item_ids[i]]['metadata']
                })
        
        # Find potential duplicates (clusters with high similarity)
        for cluster_id, items in clusters.items():
            if len(items) > 1:
                potential_duplicates.append({
                    'cluster_id': cluster_id,
                    'items': items,
                    'similarity_threshold': threshold
                })
        
        return {
            'clusters': dict(clusters),
            'potential_duplicates': potential_duplicates,
            'noise_items': sum(1 for label in cluster_labels if label == -1)
        }
    
    def save_database(self, filepath: str):
        """Save the item database to file"""
        database_data = {
            'item_database': self.item_database,
            'feature_database': {k: v.tolist() for k, v in self.feature_database.items()},
            'timestamp': datetime.now().isoformat()
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(database_data, f)
        
        logger.info(f"Database saved to {filepath}")
    
    def load_database(self, filepath: str):
        """Load the item database from file"""
        if not os.path.exists(filepath):
            logger.warning(f"Database file not found: {filepath}")
            return
        
        with open(filepath, 'rb') as f:
            database_data = pickle.load(f)
        
        self.item_database = database_data['item_database']
        self.feature_database = {
            k: np.array(v) for k, v in database_data['feature_database'].items()
        }
        
        logger.info(f"Database loaded from {filepath} with {len(self.item_database)} items")
    
    def save_model(self, filepath: str):
        """Save the trained model"""
        torch.save(self.feature_extractor.state_dict(), filepath)
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """Load a trained model"""
        self.feature_extractor.load_state_dict(torch.load(filepath, map_location=self.device))
        self.feature_extractor.eval()
        logger.info(f"Model loaded from {filepath}")

# API endpoints and usage examples
def create_matching_api():
    """Create a REST API for the item matching system"""
    from flask import Flask, request, jsonify
    import base64
    
    app = Flask(__name__)
    matcher = AdvancedItemMatcher()
    
    @app.route('/add_item', methods=['POST'])
    def add_item():
        try:
            data = request.get_json()
            
            # Decode base64 image
            image_data = base64.b64decode(data['image'])
            
            result = matcher.add_item_to_database(
                item_id=data['item_id'],
                image_input=image_data,
                metadata=data['metadata']
            )
            
            return jsonify(result)
            
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 400
    
    @app.route('/find_matches', methods=['POST'])
    def find_matches():
        try:
            data = request.get_json()
            
            # Decode base64 image
            image_data = base64.b64decode(data['image'])
            
            matches = matcher.find_matches(
                query_image=image_data,
                threshold=data.get('threshold', 0.8),
                max_matches=data.get('max_matches', 10)
            )
            
            return jsonify({'matches': matches})
            
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    @app.route('/analyze_duplicates', methods=['GET'])
    def analyze_duplicates():
        try:
            threshold = request.args.get('threshold', 0.9, type=float)
            analysis = matcher.smart_clustering_analysis(threshold)
            return jsonify(analysis)
            
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    return app

# Example usage
if __name__ == "__main__":
    # Initialize the matcher
    matcher = AdvancedItemMatcher()
    
    # Example: Add items to database
    sample_items = [
        {
            'item_id': 'lost_001',
            'image_path': 'sample_images/red_shirt.jpg',
            'metadata': {
                'status': 'lost',
                'description': 'Red cotton t-shirt',
                'location': 'Laundry Room A',
                'date_reported': '2024-01-15',
                'reporter_contact': 'user@example.com'
            }
        }
    ]
    
    # Add items (if images exist)
    for item in sample_items:
        if os.path.exists(item['image_path']):
            result = matcher.add_item_to_database(
                item['item_id'],
                item['image_path'],
                item['metadata']
            )
            print(f"Added item: {result}")
    
    # Save database
    os.makedirs('models', exist_ok=True)
    matcher.save_database('models/item_database.pkl')
    
    logger.info("Advanced item matching system initialized successfully")