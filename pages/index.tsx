import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import '../app/globals.css';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [inputText, setInputText] = useState('');
  const [transcription, setTranscription] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username === 'admin' && password === 'pantera1A@') {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, generate audio
      const audioResponse = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          youtubeUrl,
          text: inputText,
          template: 'podcast',
          speaker1Voice: 'aura-asteria-en',
          speaker2Voice: 'aura-arcas-en',
        }),
      });

      if (!audioResponse.ok) {
        throw new Error(`HTTP error! status: ${audioResponse.status}`);
      }

      const audioData = await audioResponse.json();
      setAudioUrl(audioData.audioUrl);
      setTranscription(audioData.transcript);

      // Then, generate video
      const videoResponse = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tempFileName: audioData.tempFileName,
          audioFileName: audioData.audioFileName,
          audioDuration: audioData.audioDuration,
        }),
      });

      if (!videoResponse.ok) {
        throw new Error(`HTTP error! status: ${videoResponse.status}`);
      }

      const videoData = await videoResponse.json();
      setVideoUrl(videoData.videoUrl);
    } catch (error) {
      console.error('Error processing input:', error);
      alert('Error processing input. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Audio Transcription and Video Generation</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Audio Transcription and Video Generation
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Transform your audio into transcripts and videos with ease.
          </p>
          <div className="mt-4 space-x-4">
            <button onClick={handleLogout} className="bg-red-500 text-white rounded-md px-4 py-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200">
              Logout
            </button>
            <Link href="/videos" className="bg-green-500 text-white rounded-md px-4 py-2 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200">
              Manage Videos
            </Link>
            <Link href="/bulk" className="bg-purple-500 text-white rounded-md px-4 py-2 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-200">
              Bulk Upload
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Input Options</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="audio-file" className="block text-sm font-medium text-gray-700 mb-2">Upload Audio File</label>
                <input 
                  id="audio-file" 
                  name="audio-file" 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition duration-200"
                />
              </div>
              <div>
                <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
                <input
                  type="url"
                  id="youtube-url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 mb-2">Input Text</label>
                <textarea
                  id="input-text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter your text here..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className={`w-full bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Processing...' : 'Generate Audio and Video'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {(transcription || audioUrl || videoUrl) && (
          <div className="mt-12 bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="p-6 sm:p-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Results</h2>
              {transcription && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Transcription</h3>
                  <p className="text-gray-600 bg-gray-100 p-4 rounded-md whitespace-pre-wrap">{transcription}</p>
                </div>
              )}
              {audioUrl && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Generated Audio</h3>
                  <audio src={audioUrl} controls className="w-full" />
                </div>
              )}
              {videoUrl && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Generated Video</h3>
                  <video src={videoUrl} controls className="w-full rounded-md shadow-lg" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}