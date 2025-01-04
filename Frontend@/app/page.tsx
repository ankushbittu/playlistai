'use client';
import Webcam from 'react-webcam'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Save, Music, Loader2, Camera } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

interface Song {
  id: string;
  name: string;
  artist: string;
  uri: string;
}

export default function SpotifyPlaylistGenerator() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [prompt, setPrompt] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlistName, setPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    console.log("Token in localStorage:", token ? "exists" : "none"); // Debug log
    
    if (token) {
      setAccessToken(token);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      // Instead of redirecting, show login state
      console.log("No token found, user needs to login");
    }
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/spotify`);
      const data = await response.json();
      window.location.href = data.auth_url;
    } catch (err) {
      setError('Failed to initialize login. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('spotify_access_token');
    sessionStorage.clear();
    // Clear other cache if needed
    router.push('/');
  };

  const generateSongs = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/generate-songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSongs(data.songs);
    } catch (err) {
      setError('Failed to generate songs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeSong = (songId: string) => {
    setSongs(songs.filter(song => song.id !== songId));
  };

  const savePlaylist = async () => {
    if (!playlistName) {
      setError('Please enter a playlist name');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/create-playlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: playlistName,
          songs: songs.map(song => song.uri),
        }),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setPlaylistName('');
      setSongs([]);
      setPrompt('');
      alert('Playlist created successfully! Check your Spotify account.');
    } catch (err) {
      setError('Failed to create playlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePromptCardClick = (promptText: string) => {
    setPrompt(promptText);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="max-w-4xl mx-auto p-6 bg-gray-50">
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6">
          {!isAuthenticated ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Welcome to AI Playlist Generator</h2>
              <p className="text-gray-600 mb-6">Create personalized playlists using AI</p>
              <Button 
                onClick={handleLogin} 
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Login with Spotify
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Generate Your Playlist</h2>
                <Button 
                  onClick={() => {
                    localStorage.removeItem('spotify_access_token');
                    setIsAuthenticated(false);
                    setAccessToken('');
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Logout
                </Button>
              </div>

              <div className="mb-6">
                <div className="flex gap-4 mb-4">
                  <Input
                    placeholder="Describe the kind of playlist you want..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={generateSongs}
                    disabled={loading || !prompt}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      'Generate'
                    )}
                  </Button>
                </div>

                <Button 
                  onClick={() => router.push('/emotion')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Generate Playlist from Your Emotion
                </Button>

                {error && (
                  <Alert className="mt-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {songs.length > 0 && (
                  <div className="mt-6">
                    <Input
                      placeholder="Enter playlist name"
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      className="mb-4"
                      disabled={loading}
                    />
                    
                    <div className="space-y-2 mb-4">
                      {songs.map((song) => (
                        <div 
                          key={song.id} 
                          className="flex items-center justify-between p-3 font-bold text-gray-800"
                        >
                          <div className="flex items-center gap-2">
                            <Music className="w-5 h-5" />
                            <span>{song.name} - {song.artist}</span>
                          </div>
                          <Button
                            onClick={() => removeSong(song.id)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={savePlaylist}
                      disabled={loading || songs.length === 0 || !playlistName}
                      className="w-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Playlist to Spotify
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Quick Prompts */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Prompts</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    {
                      title: "90s Rock Hits",
                      description: "Classic rock songs from the 90s with high energy and iconic guitar riffs",
                      gradient: "from-pink-500 to-rose-500"
                    },
                    {
                      title: "Chill Study Session",
                      description: "Calm instrumental tracks perfect for studying or focused work",
                      gradient: "from-blue-400 to-cyan-500"
                    },
                    {
                      title: "Workout Energy",
                      description: "High-tempo, motivating songs to keep you energized during workouts",
                      gradient: "from-green-400 to-emerald-500"
                    },
                    {
                      title: "Road Trip Mix",
                      description: "Fun, upbeat songs perfect for a long drive",
                      gradient: "from-yellow-400 to-orange-500"
                    },
                    {
                      title: "Romantic Evening",
                      description: "Smooth and romantic songs for a special evening",
                      gradient: "from-purple-500 to-violet-500"
                    },
                    {
                      title: "Party Hits",
                      description: "Popular dance and party songs to get everyone moving",
                      gradient: "from-red-500 to-pink-500"
                    }
                  ].map((promptCard, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromptCardClick(promptCard.description)}
                      className={`p-4 rounded-lg bg-gradient-to-r ${promptCard.gradient} text-white shadow-md hover:shadow-lg transition-shadow duration-300 text-left`}
                    >
                      <h4 className="font-bold mb-2">{promptCard.title}</h4>
                      <p className="text-sm opacity-90">{promptCard.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}