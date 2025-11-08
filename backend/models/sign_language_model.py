import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import pickle
import os


class SignLanguageModel:
    """Sign language recognition model using MediaPipe hand landmarks"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.classes = None
        self.model_path = os.path.join(os.path.dirname(__file__), "asl_model.pkl")
        self.scaler_path = os.path.join(os.path.dirname(__file__), "asl_scaler.pkl")
        self.load_or_initialize()
    
    def load_or_initialize(self):
        """Load existing model or initialize a new one"""
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            try:
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                with open(self.scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                # Get classes from model
                if hasattr(self.model, 'classes_'):
                    self.classes = self.model.classes_
                print("Loaded existing ASL model")
            except Exception as e:
                print(f"Error loading model: {e}. Initializing new model.")
                self._initialize_model()
        else:
            self._initialize_model()
    
    def _initialize_model(self):
        """Initialize a new Random Forest classifier"""
        # For hackathon: start with alphabet (A-Z)
        # This can be expanded later
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=20,
            random_state=42,
            n_jobs=-1
        )
        # Initialize with dummy data to set up structure
        # In production, this would be trained on real data
        dummy_features = np.random.rand(26, 63)  # 21 landmarks * 3 coords = 63 features
        dummy_labels = [chr(ord('A') + i) for i in range(26)]
        self.model.fit(dummy_features, dummy_labels)
        self.classes = self.model.classes_
        print("Initialized new ASL model (dummy data - needs training)")
    
    def preprocess_landmarks(self, landmarks):
        """Convert landmarks to feature vector"""
        # Flatten landmarks: [x1, y1, z1, x2, y2, z2, ...]
        features = []
        for landmark in landmarks:
            features.extend([landmark.x, landmark.y, landmark.z])
        return np.array(features).reshape(1, -1)
    
    def predict(self, landmarks):
        """Predict sign from hand landmarks"""
        if self.model is None:
            return "UNKNOWN", 0.0, {}
        
        # Preprocess landmarks
        features = self.preprocess_landmarks(landmarks)
        
        # Scale features (fit scaler if not already fitted)
        try:
            features_scaled = self.scaler.transform(features)
        except ValueError:
            # Scaler not fitted yet, fit it on this single sample (not ideal but works for prototype)
            features_scaled = self.scaler.fit_transform(features)
        
        # Predict
        prediction = self.model.predict(features_scaled)[0]
        probabilities = self.model.predict_proba(features_scaled)[0]
        
        # Get confidence (max probability)
        confidence = float(np.max(probabilities))
        
        # Create dictionary of all predictions
        all_predictions = {
            str(cls): float(prob) 
            for cls, prob in zip(self.model.classes_, probabilities)
        }
        
        return str(prediction), confidence, all_predictions
    
    def train(self, X, y):
        """Train the model on new data"""
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled, y)
        self.classes = self.model.classes_
        
        # Save model
        self.save()
    
    def save(self):
        """Save model and scaler to disk"""
        try:
            with open(self.model_path, 'wb') as f:
                pickle.dump(self.model, f)
            with open(self.scaler_path, 'wb') as f:
                pickle.dump(self.scaler, f)
            print("Model saved successfully")
        except Exception as e:
            print(f"Error saving model: {e}")


# Global model instance
_model_instance = None

def get_model():
    """Get or create model instance (singleton)"""
    global _model_instance
    if _model_instance is None:
        _model_instance = SignLanguageModel()
    return _model_instance

