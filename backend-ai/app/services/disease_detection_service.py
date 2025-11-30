import os
import numpy as np
from tensorflow import keras
from PIL import Image
import io
from typing import Optional


class DiseaseDetectionService:
    """Service for detecting plant diseases using AI model"""
    
    # Disease labels mapping (based on PlantVillage dataset)
    DISEASE_LABELS = {
        0: "Apple - Apple scab",
        1: "Apple - Black rot",
        2: "Apple - Cedar apple rust",
        3: "Apple - healthy",
        4: "Blueberry - healthy",
        5: "Cherry (including sour) - Powdery mildew",
        6: "Cherry (including sour) - healthy",
        7: "Corn (maize) - Cercospora leaf spot Gray leaf spot",
        8: "Corn (maize) - Common rust",
        9: "Corn (maize) - Northern Leaf Blight",
        10: "Corn (maize) - healthy",
        11: "Grape - Black rot",
        12: "Grape - Esca (Black Measles)",
        13: "Grape - Leaf blight (Isariopsis Leaf Spot)",
        14: "Grape - healthy",
        15: "Orange - Haunglongbing (Citrus greening)",
        16: "Peach - Bacterial spot",
        17: "Peach - healthy",
        18: "Pepper, bell - Bacterial spot",
        19: "Pepper, bell - healthy",
        20: "Potato - Early blight",
        21: "Potato - Late blight",
        22: "Potato - healthy",
        23: "Raspberry - healthy",
        24: "Soybean - healthy",
        25: "Squash - Powdery mildew",
        26: "Strawberry - Leaf scorch",
        27: "Strawberry - healthy",
        28: "Tomato - Bacterial spot",
        29: "Tomato - Early blight",
        30: "Tomato - Late blight",
        31: "Tomato - Leaf Mold",
        32: "Tomato - Septoria leaf spot",
        33: "Tomato - Spider mites Two-spotted spider mite",
        34: "Tomato - Target Spot",
        35: "Tomato - Tomato Yellow Leaf Curl Virus",
        36: "Tomato - Tomato mosaic virus",
        37: "Tomato - healthy",
        38: "Unknown"
    }
    
    def __init__(self):
        """Initialize the disease detection model"""
        self.model = None
        self.model_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "ai",
            "disease_detection.h5"
        )
        self._load_model()
    
    def _load_model(self) -> None:
        """Load the pre-trained disease detection model"""
        try:
            self.model = keras.models.load_model(self.model_path)
            
            # Set input size to 150x150 as per your model
            self.input_height = 150
            self.input_width = 150
            
            print(f"Disease detection model loaded successfully from {self.model_path}")
            print(f"Model expects input shape: {self.input_height}x{self.input_width}")
        except Exception as e:
            print(f"Error loading disease detection model: {str(e)}")
            raise Exception(f"Failed to load AI model: {str(e)}")
    
    def preprocess_image(self, image_bytes: bytes) -> np.ndarray:
        """
        Preprocess image for model prediction
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            Preprocessed image array ready for model input
        """
        try:
            # Open image from bytes
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if needed
            if image.mode != "RGB":
                image = image.convert("RGB")
            
            # Resize to model's expected input size
            target_size = (self.input_width, self.input_height)
            image = image.resize(target_size)
            
            # Convert to numpy array
            image_array = np.array(image)
            
            # Normalize pixel values to [0, 1]
            image_array = image_array.astype(np.float32) / 255.0
            
            # Add batch dimension
            image_array = np.expand_dims(image_array, axis=0)
            
            return image_array
            
        except Exception as e:
            raise ValueError(f"Error preprocessing image: {str(e)}")
    
    def predict_disease(self, image_bytes: bytes) -> dict:
        """
        Predict disease from plant image
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            Dictionary containing disease name and confidence score
        """
        if self.model is None:
            raise Exception("Model not loaded")
        
        try:
            # Preprocess image
            processed_image = self.preprocess_image(image_bytes)
            
            # Make prediction
            predictions = self.model.predict(processed_image)
            
            # Get the predicted class and confidence
            predicted_class = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class])
            
            # Get disease name
            disease_name = self.DISEASE_LABELS.get(
                predicted_class,
                f"Unknown Disease (Class {predicted_class})"
            )
            
            # Get top 3 predictions
            top_3_indices = np.argsort(predictions[0])[-3:][::-1]
            top_predictions = [
                {
                    "disease": self.DISEASE_LABELS.get(idx, f"Unknown (Class {idx})"),
                    "confidence": float(predictions[0][idx])
                }
                for idx in top_3_indices
            ]
            
            return {
                "disease_name": disease_name,
                "confidence": confidence,
                "top_predictions": top_predictions
            }
            
        except Exception as e:
            raise Exception(f"Error during disease prediction: {str(e)}")
