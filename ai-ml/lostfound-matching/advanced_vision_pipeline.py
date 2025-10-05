"""
Advanced Computer Vision Pipeline for Lost & Found Item Matching
Implements state-of-the-art deep learning techniques for visual similarity matching
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
import torchvision.models as models
import cv2
import numpy as np
from PIL import Image
import json
import logging
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import pickle
from pathlib import Path
import hashlib
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class VisionConfig:
    """Configuration for computer vision pipeline"""
    image_size: int = 224
    embedding_dim: int = 512
    batch_size: int = 32
    similarity_threshold: float = 0.75
    max_matches: int = 10
    use_gpu: bool = True
    color_weight: float = 0.3
    texture_weight: float = 0.3
    shape_weight: float = 0.4

class ColorAnalyzer:
    """Advanced color analysis and histogram matching"""
    
    def __init__(self):
        self.color_spaces = ['HSV', 'LAB', 'RGB']
        
    def extract_dominant_colors(self, image: np.ndarray, k: int = 5) -> List[Tuple[int, int, int]]:
        """Extract dominant colors using K-means clustering"""
        # Reshape image to be a list of pixels
        data = image.reshape((-1, 3))
        data = np.float32(data)
        
        # Apply K-means
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
        _, labels, centers = cv2.kmeans(data, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        # Convert centers to uint8 and return as list of tuples
        centers = np.uint8(centers)
        return [tuple(color) for color in centers]
    
    def calculate_color_histogram(self, image: np.ndarray, color_space: str = 'HSV') -> np.ndarray:
        """Calculate color histogram in specified color space"""
        if color_space == 'HSV':
            converted = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
            # Calculate histogram for H, S, V channels
            hist_h = cv2.calcHist([converted], [0], None, [180], [0, 180])
            hist_s = cv2.calcHist([converted], [1], None, [256], [0, 256])
            hist_v = cv2.calcHist([converted], [2], None, [256], [0, 256])
            histogram = np.concatenate([hist_h.flatten(), hist_s.flatten(), hist_v.flatten()])
            
        elif color_space == 'LAB':
            converted = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
            hist_l = cv2.calcHist([converted], [0], None, [256], [0, 256])
            hist_a = cv2.calcHist([converted], [1], None, [256], [0, 256])
            hist_b = cv2.calcHist([converted], [2], None, [256], [0, 256])
            histogram = np.concatenate([hist_l.flatten(), hist_a.flatten(), hist_b.flatten()])
            
        else:  # RGB
            hist_r = cv2.calcHist([image], [0], None, [256], [0, 256])
            hist_g = cv2.calcHist([image], [1], None, [256], [0, 256])
            hist_b = cv2.calcHist([image], [2], None, [256], [0, 256])
            histogram = np.concatenate([hist_r.flatten(), hist_g.flatten(), hist_b.flatten()])
        
        # Normalize histogram
        histogram = histogram / (histogram.sum() + 1e-6)
        return histogram
    
    def compare_histograms(self, hist1: np.ndarray, hist2: np.ndarray) -> float:
        """Compare two histograms using correlation method"""
        return cv2.compareHist(hist1.astype(np.float32), hist2.astype(np.float32), cv2.HISTCMP_CORREL)
    
    def analyze_color_similarity(self, image1: np.ndarray, image2: np.ndarray) -> Dict:
        """Comprehensive color similarity analysis"""
        similarities = {}
        
        for color_space in self.color_spaces:
            hist1 = self.calculate_color_histogram(image1, color_space)
            hist2 = self.calculate_color_histogram(image2, color_space)
            similarities[f'{color_space.lower()}_similarity'] = self.compare_histograms(hist1, hist2)
        
        # Dominant colors comparison
        colors1 = self.extract_dominant_colors(image1)
        colors2 = self.extract_dominant_colors(image2)
        
        # Calculate dominant color similarity
        color_distances = []
        for c1 in colors1:
            min_dist = min([np.linalg.norm(np.array(c1) - np.array(c2)) for c2 in colors2])
            color_distances.append(min_dist)
        
        dominant_color_similarity = 1.0 - (np.mean(color_distances) / 255.0)
        similarities['dominant_color_similarity'] = max(0.0, dominant_color_similarity)
        
        # Overall color similarity (weighted average)
        overall_similarity = (
            0.4 * similarities['hsv_similarity'] +
            0.3 * similarities['lab_similarity'] +
            0.2 * similarities['rgb_similarity'] +
            0.1 * similarities['dominant_color_similarity']
        )
        similarities['overall_color_similarity'] = overall_similarity
        
        return similarities

class TextureAnalyzer:
    """Advanced texture analysis using local binary patterns and Gabor filters"""
    
    def __init__(self):
        self.lbp_radius = 1
        self.lbp_n_points = 8
        
    def calculate_lbp(self, image: np.ndarray) -> np.ndarray:
        """Calculate Local Binary Pattern histogram"""
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY) if len(image.shape) == 3 else image
        
        # Calculate LBP
        lbp = np.zeros_like(gray)
        height, width = gray.shape
        
        for i in range(self.lbp_radius, height - self.lbp_radius):
            for j in range(self.lbp_radius, width - self.lbp_radius):
                center = gray[i, j]
                binary_string = ''
                
                # Compare with 8 neighbors
                neighbors = [
                    gray[i-1, j-1], gray[i-1, j], gray[i-1, j+1],
                    gray[i, j+1], gray[i+1, j+1], gray[i+1, j],
                    gray[i+1, j-1], gray[i, j-1]
                ]
                
                for neighbor in neighbors:
                    binary_string += '1' if neighbor >= center else '0'
                
                lbp[i, j] = int(binary_string, 2)
        
        # Calculate histogram
        hist, _ = np.histogram(lbp.flatten(), bins=256, range=(0, 256))
        hist = hist.astype(np.float32)
        hist = hist / (hist.sum() + 1e-6)
        
        return hist
    
    def calculate_gabor_responses(self, image: np.ndarray) -> np.ndarray:
        """Calculate Gabor filter responses for texture analysis"""
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY) if len(image.shape) == 3 else image
        
        # Gabor filter parameters
        orientations = [0, 45, 90, 135]  # degrees
        frequencies = [0.1, 0.3, 0.5]
        
        responses = []
        
        for theta in orientations:
            for freq in frequencies:
                # Create Gabor kernel
                kernel = cv2.getGaborKernel((21, 21), 5, np.radians(theta), 2*np.pi*freq, 0.5, 0, ktype=cv2.CV_32F)
                
                # Apply filter
                filtered = cv2.filter2D(gray, cv2.CV_8UC3, kernel)
                
                # Calculate energy (mean of squared responses)
                energy = np.mean(filtered**2)
                responses.append(energy)
        
        return np.array(responses)
    
    def analyze_texture_similarity(self, image1: np.ndarray, image2: np.ndarray) -> Dict:
        """Comprehensive texture similarity analysis"""
        # LBP comparison
        lbp1 = self.calculate_lbp(image1)
        lbp2 = self.calculate_lbp(image2)
        lbp_similarity = cv2.compareHist(lbp1, lbp2, cv2.HISTCMP_CORREL)
        
        # Gabor filter comparison
        gabor1 = self.calculate_gabor_responses(image1)
        gabor2 = self.calculate_gabor_responses(image2)
        
        # Calculate correlation between Gabor responses
        gabor_similarity = np.corrcoef(gabor1, gabor2)[0, 1]
        gabor_similarity = max(0.0, gabor_similarity) if not np.isnan(gabor_similarity) else 0.0
        
        # Edge density comparison
        edges1 = cv2.Canny(cv2.cvtColor(image1, cv2.COLOR_RGB2GRAY), 50, 150)
        edges2 = cv2.Canny(cv2.cvtColor(image2, cv2.COLOR_RGB2GRAY), 50, 150)
        
        edge_density1 = np.sum(edges1 > 0) / edges1.size
        edge_density2 = np.sum(edges2 > 0) / edges2.size
        edge_similarity = 1.0 - abs(edge_density1 - edge_density2)
        
        return {
            'lbp_similarity': max(0.0, lbp_similarity),
            'gabor_similarity': gabor_similarity,
            'edge_similarity': edge_similarity,
            'overall_texture_similarity': (0.5 * lbp_similarity + 0.3 * gabor_similarity + 0.2 * edge_similarity)
        }

class ShapeAnalyzer:
    """Advanced shape analysis using contours and Hu moments"""
    
    def __init__(self):
        self.contour_threshold = 127
        
    def extract_contours(self, image: np.ndarray) -> List[np.ndarray]:
        """Extract contours from image"""
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY) if len(image.shape) == 3 else image
        
        # Apply threshold
        _, binary = cv2.threshold(gray, self.contour_threshold, 255, cv2.THRESH_BINARY)
        
        # Find contours
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter small contours
        min_area = 100
        filtered_contours = [c for c in contours if cv2.contourArea(c) > min_area]
        
        return filtered_contours
    
    def calculate_hu_moments(self, contour: np.ndarray) -> np.ndarray:
        """Calculate Hu moments for shape description"""
        moments = cv2.moments(contour)
        hu_moments = cv2.HuMoments(moments)
        
        # Log transform for better comparison
        hu_moments = -np.sign(hu_moments) * np.log10(np.abs(hu_moments) + 1e-10)
        
        return hu_moments.flatten()
    
    def calculate_contour_features(self, contour: np.ndarray) -> Dict:
        """Calculate various contour features"""
        area = cv2.contourArea(contour)
        perimeter = cv2.arcLength(contour, True)
        
        if perimeter == 0:
            return {'area': area, 'perimeter': perimeter, 'compactness': 0, 'aspect_ratio': 0}
        
        # Compactness (circularity)
        compactness = (perimeter * perimeter) / (4 * np.pi * area) if area > 0 else float('inf')
        
        # Bounding rectangle
        x, y, w, h = cv2.boundingRect(contour)
        aspect_ratio = w / h if h > 0 else 0
        
        # Convex hull
        hull = cv2.convexHull(contour)
        hull_area = cv2.contourArea(hull)
        solidity = area / hull_area if hull_area > 0 else 0
        
        return {
            'area': area,
            'perimeter': perimeter,
            'compactness': compactness,
            'aspect_ratio': aspect_ratio,
            'solidity': solidity
        }
    
    def analyze_shape_similarity(self, image1: np.ndarray, image2: np.ndarray) -> Dict:
        """Comprehensive shape similarity analysis"""
        contours1 = self.extract_contours(image1)
        contours2 = self.extract_contours(image2)
        
        if not contours1 or not contours2:
            return {
                'hu_moments_similarity': 0.0,
                'contour_features_similarity': 0.0,
                'overall_shape_similarity': 0.0
            }
        
        # Find largest contours (main objects)
        main_contour1 = max(contours1, key=cv2.contourArea)
        main_contour2 = max(contours2, key=cv2.contourArea)
        
        # Hu moments comparison
        hu1 = self.calculate_hu_moments(main_contour1)
        hu2 = self.calculate_hu_moments(main_contour2)
        
        hu_distance = np.linalg.norm(hu1 - hu2)
        hu_similarity = 1.0 / (1.0 + hu_distance)
        
        # Contour features comparison
        features1 = self.calculate_contour_features(main_contour1)
        features2 = self.calculate_contour_features(main_contour2)
        
        feature_similarities = []
        for key in features1:
            if features1[key] == 0 and features2[key] == 0:
                sim = 1.0
            elif features1[key] == 0 or features2[key] == 0:
                sim = 0.0
            else:
                diff = abs(features1[key] - features2[key])
                max_val = max(features1[key], features2[key])
                sim = 1.0 - (diff / max_val)
            feature_similarities.append(sim)
        
        contour_features_similarity = np.mean(feature_similarities)
        
        # Shape matching using contour comparison
        match_score = cv2.matchShapes(main_contour1, main_contour2, cv2.CONTOURS_MATCH_I1, 0)
        shape_match_similarity = 1.0 / (1.0 + match_score)
        
        overall_similarity = (
            0.4 * hu_similarity +
            0.3 * contour_features_similarity +
            0.3 * shape_match_similarity
        )
        
        return {
            'hu_moments_similarity': hu_similarity,
            'contour_features_similarity': contour_features_similarity,
            'shape_match_similarity': shape_match_similarity,
            'overall_shape_similarity': overall_similarity
        }

class DeepFeatureExtractor(nn.Module):
    """Deep learning feature extractor using pre-trained ResNet"""
    
    def __init__(self, model_name: str = 'resnet50', embedding_dim: int = 512):
        super(DeepFeatureExtractor, self).__init__()
        
        # Load pre-trained model
        if model_name == 'resnet50':
            self.backbone = models.resnet50(pretrained=True)
            backbone_dim = self.backbone.fc.in_features
            self.backbone.fc = nn.Identity()
        elif model_name == 'efficientnet':
            self.backbone = models.efficientnet_b0(pretrained=True)
            backbone_dim = self.backbone.classifier[1].in_features
            self.backbone.classifier = nn.Identity()
        else:
            raise ValueError(f"Unsupported model: {model_name}")
        
        # Feature projection layer
        self.projection = nn.Sequential(
            nn.Linear(backbone_dim, embedding_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(embedding_dim, embedding_dim),
            nn.L2Norm(dim=1)  # L2 normalization for cosine similarity
        )
        
        # Freeze backbone parameters for faster inference
        for param in self.backbone.parameters():
            param.requires_grad = False
    
    def forward(self, x):
        features = self.backbone(x)
        embeddings = self.projection(features)
        return embeddings

class L2Norm(nn.Module):
    """L2 normalization layer"""
    def __init__(self, dim=1):
        super(L2Norm, self).__init__()
        self.dim = dim
    
    def forward(self, x):
        return F.normalize(x, p=2, dim=self.dim)

class AdvancedItemMatcher:
    """Advanced item matching system combining multiple computer vision techniques"""
    
    def __init__(self, config: VisionConfig):
        self.config = config
        self.device = torch.device('cuda' if config.use_gpu and torch.cuda.is_available() else 'cpu')
        
        # Initialize analyzers
        self.color_analyzer = ColorAnalyzer()
        self.texture_analyzer = TextureAnalyzer()
        self.shape_analyzer = ShapeAnalyzer()
        
        # Initialize deep feature extractor
        self.feature_extractor = DeepFeatureExtractor(embedding_dim=config.embedding_dim)
        self.feature_extractor.to(self.device)
        self.feature_extractor.eval()
        
        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((config.image_size, config.image_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        logger.info(f"Initialized AdvancedItemMatcher on device: {self.device}")
    
    def preprocess_image(self, image_path: str) -> Tuple[np.ndarray, torch.Tensor]:
        """Load and preprocess image for analysis"""
        # Load image
        image = cv2.imread(image_path)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Create PIL image for transforms
        pil_image = Image.fromarray(image_rgb)
        tensor_image = self.transform(pil_image).unsqueeze(0).to(self.device)
        
        return image_rgb, tensor_image
    
    def extract_deep_features(self, tensor_image: torch.Tensor) -> np.ndarray:
        """Extract deep learning features from image"""
        with torch.no_grad():
            features = self.feature_extractor(tensor_image)
            return features.cpu().numpy().flatten()
    
    def calculate_comprehensive_similarity(self, image1_path: str, image2_path: str) -> Dict:
        """Calculate comprehensive similarity between two images"""
        # Preprocess images
        img1_rgb, img1_tensor = self.preprocess_image(image1_path)
        img2_rgb, img2_tensor = self.preprocess_image(image2_path)
        
        # Extract deep features
        features1 = self.extract_deep_features(img1_tensor)
        features2 = self.extract_deep_features(img2_tensor)
        
        # Calculate cosine similarity for deep features
        deep_similarity = np.dot(features1, features2) / (np.linalg.norm(features1) * np.linalg.norm(features2))
        
        # Analyze color similarity
        color_analysis = self.color_analyzer.analyze_color_similarity(img1_rgb, img2_rgb)
        
        # Analyze texture similarity
        texture_analysis = self.texture_analyzer.analyze_texture_similarity(img1_rgb, img2_rgb)
        
        # Analyze shape similarity
        shape_analysis = self.shape_analyzer.analyze_shape_similarity(img1_rgb, img2_rgb)
        
        # Calculate overall similarity score
        overall_similarity = (
            self.config.color_weight * color_analysis['overall_color_similarity'] +
            self.config.texture_weight * texture_analysis['overall_texture_similarity'] +
            self.config.shape_weight * shape_analysis['overall_shape_similarity'] +
            0.4 * deep_similarity  # Deep learning features weight
        ) / (self.config.color_weight + self.config.texture_weight + self.config.shape_weight + 0.4)
        
        return {
            'overall_similarity': float(overall_similarity),
            'deep_similarity': float(deep_similarity),
            'color_analysis': color_analysis,
            'texture_analysis': texture_analysis,
            'shape_analysis': shape_analysis,
            'is_match': overall_similarity >= self.config.similarity_threshold
        }
    
    def find_matches(self, query_image_path: str, candidate_image_paths: List[str]) -> List[Dict]:
        """Find best matches for a query image from candidate images"""
        matches = []
        
        for candidate_path in candidate_image_paths:
            try:
                similarity_result = self.calculate_comprehensive_similarity(query_image_path, candidate_path)
                
                match_info = {
                    'candidate_path': candidate_path,
                    'similarity_score': similarity_result['overall_similarity'],
                    'is_match': similarity_result['is_match'],
                    'deep_similarity': similarity_result['deep_similarity'],
                    'color_similarity': similarity_result['color_analysis']['overall_color_similarity'],
                    'texture_similarity': similarity_result['texture_analysis']['overall_texture_similarity'],
                    'shape_similarity': similarity_result['shape_analysis']['overall_shape_similarity']
                }
                
                matches.append(match_info)
                
            except Exception as e:
                logger.error(f"Error processing candidate {candidate_path}: {str(e)}")
                continue
        
        # Sort by similarity score
        matches.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        # Return top matches
        return matches[:self.config.max_matches]
    
    def save_model(self, filepath: str):
        """Save the feature extractor model"""
        torch.save({
            'model_state_dict': self.feature_extractor.state_dict(),
            'config': self.config.__dict__
        }, filepath)
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """Load a pre-trained feature extractor model"""
        checkpoint = torch.load(filepath, map_location=self.device)
        self.feature_extractor.load_state_dict(checkpoint['model_state_dict'])
        logger.info(f"Model loaded from {filepath}")

def main():
    """Main function to demonstrate advanced item matching"""
    # Configuration
    config = VisionConfig(
        image_size=224,
        embedding_dim=512,
        similarity_threshold=0.7,
        max_matches=5,
        color_weight=0.3,
        texture_weight=0.3,
        shape_weight=0.4
    )
    
    # Initialize matcher
    matcher = AdvancedItemMatcher(config)
    
    print("Advanced Computer Vision Item Matcher initialized successfully!")
    print(f"Device: {matcher.device}")
    print(f"Similarity threshold: {config.similarity_threshold}")
    
    # Example usage (would require actual image paths)
    # query_image = "path/to/lost_item.jpg"
    # candidates = ["path/to/found_item1.jpg", "path/to/found_item2.jpg"]
    # matches = matcher.find_matches(query_image, candidates)
    # 
    # for match in matches:
    #     print(f"Match: {match['candidate_path']}")
    #     print(f"Similarity: {match['similarity_score']:.4f}")
    #     print(f"Is Match: {match['is_match']}")

if __name__ == "__main__":
    main()