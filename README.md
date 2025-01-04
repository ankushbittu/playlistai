# EmotionalBeats: AI-Powered Spotify Playlist Generator

## Description
EmotionalBeats is an innovative application that combines emotion recognition technology with music curation to create personalized Spotify playlists using llms. By analyzing facial expressions through advanced computer vision and deep learning techniques, the application generates playlists that match your current emotional state, preferred language, and artist preferences.


## Features
- Real-time emotion detection through webcam
- Multi-language playlist generation
- Artist preference customization
- Seamless Spotify integration
- Manual emotion selection option
- Real-time playlist generation and management
- Multi-emotion support (Happy, Sad, Energetic, Calm, Romantic, Melancholic)

## Technology Stack

### Frontend
- Next.js with TypeScript
- Tailwind CSS for styling
- React Webcam for camera integration
- Spotify Web API integration

### Backend
- Flask (Python)
- OpenCV for image processing
- TensorFlow for emotion detection
- Google Gemini AI for playlist generation
- Spotipy for Spotify API interaction

### Machine Learning Pipeline

#### Image Processing
- Image resizing to 224x224 pixels
- Face alignment for standardized orientation
- Image normalization (zero mean, unit variance)
- Lighting condition compensation

#### Facial Landmark Detection
- Pre-trained facial landmark detection model
- 68-point facial landmark mapping including:
 - Eye corners and centers
 - Eyebrow edges
 - Nose tip and edges
 - Mouth corners and edges
 - Jawline edges
- Coordinate extraction for feature analysis

#### Feature Extraction
1. Geometric Features:
  - Eye Aspect Ratio (EAR)
  - Mouth Aspect Ratio (MAR)
  - Eyebrow angle calculation
  - Nose-mouth distance metrics

2. Appearance Features:
  - Gabor filter responses
  - Local Binary Patterns (LBP)
  - Histograms of Oriented Gradients (HOG)

#### Emotion Classification
- Pre-trained machine learning model
- Support for multiple emotion classes
- Trained on extensive facial expression dataset

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- Spotify Developer Account
- Google Cloud Account (for Gemini API)
- Webcam access

### Backend Setup
```bash
# Clone repository
git clone [repository-url]
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# For Windows
venv\Scripts\activate
# For Unix/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# create an env file and replace the ids with your developer spotify credantials and gemniai or any other llms apis
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback # it depends on your network
GEMINI_API_KEY=your_gemini_api_key