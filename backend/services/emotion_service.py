import os
import cv2
import numpy as np
from tensorflow.keras.models import load_model
import base64

class EmotionService:
    # Load the model and cascade classifier at class level
    model_path = "C:/Users/HP BITTU/Downloads/final_model.keras"
    model = load_model(model_path)
    face_cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    face_cascade = cv2.CascadeClassifier(face_cascade_path)
    
    @classmethod
    def detect_emotion(cls, image_data):
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1])
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Convert the image to grayscale
            gray_image = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # Detect faces in the image
            faces = cls.face_cascade.detectMultiScale(gray_image, scaleFactor=1.3, minNeighbors=5)

            if len(faces) == 0:
                raise Exception("No face detected in the image")

            # Process the first detected face
            x, y, w, h = faces[0]
            face = gray_image[y:y+h, x:x+w]

            # Resize the face to 48x48
            resized_face = cv2.resize(face, (48, 48))

            # Normalize pixel values
            normalized_face = resized_face / 255.0

            # Prepare for model prediction
            face_array = np.expand_dims(normalized_face, axis=0)
            face_array = np.expand_dims(face_array, axis=-1)

            # Make prediction
            predictions = cls.model.predict(face_array)
            emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
            predicted_emotion_index = np.argmax(predictions)
            predicted_emotion = emotion_labels[predicted_emotion_index]

            return predicted_emotion

        except Exception as e:
            raise Exception(f"Error in emotion detection: {str(e)}")