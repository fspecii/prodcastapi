'use client';

import React, { useState } from 'react';
import Login from '../components/Login';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inputType, setInputType] = useState<'youtube' | 'text' | 'topic'>('youtube');
  const [input, setInput] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate audio
      const audioResponse = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          [inputType]: input,
          template: 'podcast',
          speaker1Voice: 'aura-asteria-en',
          speaker2Voice: 'aura-arcas-en'
        }),
      });

      if (!audioResponse.ok) {
        const errorData = await audioResponse.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const audioData = await audioResponse.json();
      setAudioUrl(audioData.audioUrl);

      // Generate video
      const videoResponse = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioFileName: audioData.audioUrl.split('/').pop(),
          audioDuration: audioData.audioDuration,
          transcript: audioData.transcript,
          words: audioData.words
        }),
      });

      if (!videoResponse.ok) {
        const errorData = await videoResponse.json();
        throw new Error(errorData.error || 'Failed to generate video');
      }

      const videoData = await videoResponse.json();
      setVideoUrl(videoData.videoUrl);
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
          <h1 className="text-2xl text-white mb-4">Login</h1>
          <Login onLogin={setIsLoggedIn} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl mb-8">Audio and Video Generator</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block mb-2">Input Type:</label>
          <select
            value={inputType}
            onChange={(e) => setInputType(e.target.value as 'youtube' | 'text' | 'topic')}
            className="w-full p-2 bg-gray-800 rounded"
          >
            <option value="youtube">YouTube Link</option>
            <option value="text">Text</option>
            <option value="topic">Topic for Script</option>
          </select>
        </div>
        <div>
          <label className="block mb-2">Input:</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-2 bg-gray-800 rounded"
            placeholder={`Enter ${inputType}`}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-2 bg-blue-600 rounded disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </form>
      {audioUrl && (
        <div className="mb-8">
          <h2 className="text-2xl mb-4">Generated Audio</h2>
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}
      {videoUrl && (
        <div>
          <h2 className="text-2xl mb-4">Generated Video</h2>
          <video controls src={videoUrl} className="w-full" />
        </div>
      )}
    </div>
  );
}
