import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import '../app/globals.css';

export default function BulkUpload() {
  const [youtubeUrls, setYoutubeUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const urls = youtubeUrls.split('\n').filter(url => url.trim() !== '');
      const response = await fetch('/api/bulk-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls }),
      });

      if (!response.ok) {
        throw new Error('Failed to add videos to bulk processing');
      }

      const data = await response.json();
      setResult(`Successfully added ${data.addedCount} out of ${urls.length} videos to the processing queue. They will be processed one by one in the background.`);
    } catch (error) {
      console.error('Error adding videos to bulk processing:', error);
      setResult('Error adding videos to bulk processing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const triggerProcessing = async () => {
    try {
      const response = await fetch('/api/process-bulk-video', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to trigger bulk video processing');
      }
      const data = await response.json();
      console.log('Bulk processing triggered:', data);
    } catch (error) {
      console.error('Error triggering bulk processing:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Bulk Video Upload</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Bulk Video Upload
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Create multiple videos from YouTube URLs.
          </p>
          <Link href="/" className="mt-4 inline-block bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200">
            Back to Home
          </Link>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="youtube-urls" className="block text-sm font-medium text-gray-700 mb-2">YouTube URLs (one per line)</label>
                <textarea
                  id="youtube-urls"
                  value={youtubeUrls}
                  onChange={(e) => setYoutubeUrls(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  required
                />
              </div>
              <div>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className={`w-full bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Processing...' : 'Generate Videos'}
                </button>
              </div>
              <button 
                onClick={triggerProcessing}
                className="mt-4 w-full bg-green-600 text-white rounded-md px-4 py-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
              >
                Trigger Bulk Processing
              </button>
            </form>
            {result && (
              <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                {result}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}