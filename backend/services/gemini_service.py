import google.generativeai as genai
from config.config import Config

class GeminiService:
    def __init__(self):
        genai.configure(api_key=Config.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')

    def generate_emotion_based_playlist(self, emotion, language, artist=None):
        base_prompt = f"Generate a playlist of 10 songs that reflect a {emotion} mood"
        if language:
            base_prompt += f" in {language} language"
        if artist:
            base_prompt += f", similar to the style of {artist}"
        
        prompt = f"""{base_prompt}. 
        The songs should match the emotional tone and energy level associated with {emotion}.
        For each song, provide it in exactly this format:
        Song Name by Artist Name

        Only provide the song and artist names, one per line, nothing else."""
        
        response = self.model.generate_content(prompt)
        return self._parse_response(response.text)

    def generate_prompt_based_playlist(self, user_prompt):
        prompt = f"""Generate a playlist of 10 songs based on this description: {user_prompt}
        For each song, provide it in exactly this format:
        Song Name by Artist Name

        Only provide the song and artist names, one per line, nothing else."""
        
        response = self.model.generate_content(prompt)
        return self._parse_response(response.text)

    def _parse_response(self, response_text):
        songs_text = response_text.strip()
        return [song.strip() for song in songs_text.split('\n') if song.strip()]