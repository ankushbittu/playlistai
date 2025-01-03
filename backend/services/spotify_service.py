from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from config.config import Config

class SpotifyService:
    @staticmethod
    def create_spotify_oauth():
        return SpotifyOAuth(
            client_id=Config.SPOTIFY_CLIENT_ID,
            client_secret=Config.SPOTIFY_CLIENT_SECRET,
            redirect_uri=Config.SPOTIFY_REDIRECT_URI,
            scope=Config.SPOTIFY_SCOPE
        )

    @staticmethod
    def get_auth_url():
        sp_oauth = SpotifyService.create_spotify_oauth()
        auth_url = sp_oauth.get_authorize_url()
        return auth_url

    @staticmethod
    def get_access_token(code):
        sp_oauth = SpotifyService.create_spotify_oauth()
        token_info = sp_oauth.get_access_token(code)
        return token_info

    @staticmethod
    def search_songs(songs_list, access_token):
        sp = Spotify(auth=access_token)
        spotify_songs = []
        
        for song_entry in songs_list:
            try:
                if 'by' in song_entry.lower():
                    song_name, artist = song_entry.split('by', 1)
                else:
                    song_name, artist = song_entry.split('-', 1)
                
                song_name = song_name.strip()
                artist = artist.strip()
                
                # First try exact search
                results = sp.search(q=f"track:{song_name} artist:{artist}", type='track', limit=1)
                
                if results['tracks']['items']:
                    track = results['tracks']['items'][0]
                    spotify_songs.append({
                        'id': track['id'],
                        'name': track['name'],
                        'artist': track['artists'][0]['name'],
                        'uri': track['uri']
                    })
                else:
                    # Try more general search
                    results = sp.search(q=f"{song_name} {artist}", type='track', limit=1)
                    if results['tracks']['items']:
                        track = results['tracks']['items'][0]
                        spotify_songs.append({
                            'id': track['id'],
                            'name': track['name'],
                            'artist': track['artists'][0]['name'],
                            'uri': track['uri']
                        })
            except Exception as e:
                print(f"Error processing song {song_entry}: {str(e)}")
                continue
        
        return spotify_songs

    @staticmethod
    def create_playlist(access_token, playlist_name, song_uris):
        sp = Spotify(auth=access_token)
        user_info = sp.current_user()
        user_id = user_info['id']
        
        playlist = sp.user_playlist_create(user_id, playlist_name)
        
        if song_uris:
            sp.playlist_add_items(playlist['id'], song_uris)
        
        return {
            'playlist_id': playlist['id'],
            'external_url': playlist['external_urls']['spotify']
        }