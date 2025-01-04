'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Music, Loader2, ArrowLeft, Trash2, Save } from 'lucide-react';

const emotions = [
  { name: 'Happy', color: 'bg-yellow-500' },
  { name: 'Sad', color: 'bg-blue-500' },
  { name: 'Energetic', color: 'bg-red-500' },
  { name: 'Calm', color: 'bg-green-500' },
  { name: 'Romantic', color: 'bg-pink-500' },
  { name: 'Melancholic', color: 'bg-purple-500' }
];

const languages = ['English', 'Hindi', 'Spanish', 'Korean', 'Tamil', 'Telugu'];

interface Song {
  id: string;
  name: string;
  artist: string;
  uri: string;
}

export default function EmotionPlaylistGenerator() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [preferredArtist, setPreferredArtist] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlistName, setPlaylistName] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    if (token) {
      setAccessToken(token);
      setIsAuthenticated(true);
    } else {
      router.push('/');
    }
  }, [router]);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      if (!imageSrc) {
        setError('No image captured. Please try again.');
      } else {
        setError('');
        handleEmotionDetection(imageSrc);
      }
    }
  }, [webcamRef]);

  const handleEmotionDetection = async (imageSrc: string) => {
    try {
      setLoading(true);
      
      // Send the full base64 string including the data URL prefix
      const response = await fetch('http://localhost:5000/api/detect-emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageSrc  // No need to process, send the complete base64 string
        }),
      });
  
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSelectedEmotion(data.emotion);
    } catch (error) {
      console.error('Error:', error);
      setError('Error detecting emotion. Please try selecting manually.');
    } finally {
      setLoading(false);
      setShowCamera(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setSelectedEmotion('');
    setShowCamera(true);
  };

  const generatePlaylist = async () => {
    if (!selectedEmotion || !selectedLanguage) {
      setError('Please select both emotion and language');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          emotion: selectedEmotion,
          language: selectedLanguage,
          artist: preferredArtist
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSongs(data.songs);
    } catch (error) {
      setError('Failed to generate playlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const savePlaylist = async () => {
    if (!playlistName) {
      setError('Please enter a playlist name');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/create-playlist', {
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
      alert('Playlist created successfully! Check your Spotify account.');
      router.push('/');
    } catch (err) {
      setError('Failed to create playlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <Button 
              onClick={() => router.push('/')}
              variant="ghost"
              className="mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-2xl font-bold text-gray-800">Create Personalized Playlist</h2>
          </div>

          <div className="space-y-6">
            {/* Camera Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Your Emotion</h3>
              {!showCamera && !capturedImage ? (
                <Button 
                  onClick={() => setShowCamera(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-4"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <div className="border rounded-lg p-4">
                  {showCamera && !capturedImage ? (
                    <div>
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-[300px] object-cover rounded-lg"
                      />
                      <div className="flex gap-4 mt-4">
                        <Button 
                          onClick={capture}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Take Photo'}
                        </Button>
                        <Button 
                          onClick={() => setShowCamera(false)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : capturedImage ? (
                    <div>
                      <img 
                        src={capturedImage} 
                        alt="Captured" 
                        className="w-full h-[300px] object-cover rounded-lg"
                      />
                      {selectedEmotion && (
                        <div className="mt-2 text-center p-2 bg-gray-100 rounded">
                          Detected Emotion: {selectedEmotion}
                        </div>
                      )}
                      <Button
                        onClick={retakePhoto}
                        className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Retake Photo
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Manual Emotion Selection */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {emotions.map((emotion) => (
                  <Button
                    key={emotion.name}
                    onClick={() => setSelectedEmotion(emotion.name)}
                    className={`${emotion.color} text-white ${
                      selectedEmotion === emotion.name ? 'ring-2 ring-offset-2' : ''
                    }`}
                  >
                    {emotion.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Preferred Language</h3>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Artist Input */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Preferred Artist (Optional)</h3>
              <Input
                value={preferredArtist}
                onChange={(e) => setPreferredArtist(e.target.value)}
                placeholder="Enter artist name..."
              />
            </div>

            {error && (
              <Alert>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Generate Button */}
            <Button
              onClick={generatePlaylist}
              disabled={loading || !selectedEmotion || !selectedLanguage}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              {loading ? 'Generating...' : 'Generate Playlist'}
            </Button>

            {/* Songs List Section */}
            {songs.length > 0 && (
              <div className="mt-8">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Name Your Playlist</h3>
                  <Input
                    placeholder="Enter playlist name"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    className="w-full"
                    disabled={loading}
                  />
                </div>

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
                        onClick={() => {
                          setSongs(songs.filter(s => s.id !== song.id));
                        }}
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
                  {loading ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Playlist to Spotify
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}