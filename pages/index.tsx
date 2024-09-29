import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('audio', file);

    try {
      // Transcribe audio
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      const transcribeData = await transcribeResponse.json();
      const transcriptionText = transcribeData.results.channels[0].alternatives[0].transcript;
      setTranscription(transcriptionText);

      // Generate video
      const generateVideoResponse = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transcription: transcribeData,
          audioFileName: file.name
        }),
      });
      const generateVideoData = await generateVideoResponse.json();
      setVideoUrl(generateVideoData.videoUrl);
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Audio Transcription and Video Generation</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input type="file" accept="audio/*" onChange={handleFileChange} className="mb-2" />
        <button type="submit" disabled={!file || loading} className="bg-blue-500 text-white px-4 py-2 rounded">
          {loading ? 'Processing...' : 'Transcribe and Generate Video'}
        </button>
      </form>
      {transcription && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Transcription:</h2>
          <p>{transcription}</p>
        </div>
      )}
      {videoUrl && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Generated Video:</h2>
          <video src={videoUrl} controls className="w-full max-w-2xl" />
        </div>
      )}
    </div>
  );
}