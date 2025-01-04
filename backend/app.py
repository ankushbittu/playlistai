from flask import Flask, request, jsonify
from flask_cors import CORS
from services.spotify_service import SpotifyService
from services.emotion_service import EmotionService
from services.gemini_service import GeminiService
import numpy as np
import cv2
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3001"}})

gemini_service = GeminiService()

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response

@app.route('/api/auth/spotify', methods=['GET'])
def get_spotify_auth():
    """Get Spotify authorization URL"""
    try:
        auth_url = SpotifyService.get_auth_url()
        return jsonify({'auth_url': auth_url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/callback', methods=['POST'])
def spotify_callback():
    """Handle Spotify auth callback and get access token"""
    try:
        code = request.json.get('code')
        token_info = SpotifyService.get_access_token(code)
        return jsonify(token_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/detect-emotion', methods=['POST'])
def detect_emotion():
    """Detect emotion from image"""
    try:
        # Check if the data is JSON
        if request.is_json:
            image_data = request.json.get('image')
            if not image_data:
                return jsonify({'error': 'No image data received'}), 400
            
            # Use the existing EmotionService
            emotion = EmotionService.detect_emotion(image_data)
            return jsonify({'emotion': emotion})
            
        # Check if it's form data
        elif 'image' in request.files:
            image_file = request.files['image']
            image_bytes = image_file.read()
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            emotion = EmotionService.detect_emotion(img)
            return jsonify({'emotion': emotion})
            
        else:
            return jsonify({'error': 'No valid image data received'}), 400
            
    except Exception as e:
        print(f"Error in emotion detection: {str(e)}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/generate-songs', methods=['POST'])
def generate_songs():
    """Generate song suggestions using Gemini AI"""
    try:
        user_prompt = request.json.get('prompt')
        emotion = request.json.get('emotion')
        language = request.json.get('language')
        artist = request.json.get('artist')
        access_token = request.headers.get('Authorization').split('Bearer ')[1]

        # Generate songs based on input type
        if emotion:
            songs_list = gemini_service.generate_emotion_based_playlist(emotion, language, artist)
        else:
            songs_list = gemini_service.generate_prompt_based_playlist(user_prompt)

        # Search songs on Spotify
        spotify_songs = SpotifyService.search_songs(songs_list, access_token)
        return jsonify({'songs': spotify_songs})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/create-playlist', methods=['POST'])
def create_playlist():
    """Create a new Spotify playlist"""
    try:
        access_token = request.headers.get('Authorization').split('Bearer ')[1]
        playlist_name = request.json.get('name')
        song_uris = request.json.get('songs')
        
        result = SpotifyService.create_playlist(access_token, playlist_name, song_uris)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)