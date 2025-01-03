'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          const response = await fetch('http://localhost:5000/api/auth/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          const data = await response.json();
          if (data.access_token) {
            // Store the token
            localStorage.setItem('spotify_access_token', data.access_token);
            // Redirect back to home page
            router.push('/');
          } else {
            throw new Error('No access token received');
          }
        } catch (error) {
          console.error('Error in callback:', error);
          router.push('/?error=auth_failed');
        }
      } else {
        router.push('/?error=no_code');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Authenticating with Spotify...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}