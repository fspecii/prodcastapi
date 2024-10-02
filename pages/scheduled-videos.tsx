import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import '../app/globals.css';

interface ScheduledVideo {
  id: number;
  filename: string;
  title: string;
  description: string;
  scheduled_date: string;
  status: string;
}

export default function ScheduledVideos() {
  const [scheduledVideos, setScheduledVideos] = useState<ScheduledVideo[]>([]);

  useEffect(() => {
    fetchScheduledVideos();
  }, []);

  const fetchScheduledVideos = async () => {
    try {
      const res = await fetch('/api/videos?scheduled=true');
      if (!res.ok) {
        throw new Error('Failed to fetch scheduled videos');
      }
      const data = await res.json();
      setScheduledVideos(data);
    } catch (error) {
      console.error('Error fetching scheduled videos:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Scheduled Videos</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Scheduled Videos
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            View your scheduled YouTube video uploads.
          </p>
          <Link href="/videos" className="mt-4 inline-block bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200">
            Back to Manage Videos
          </Link>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Scheduled Videos</h2>
            {scheduledVideos.length === 0 ? (
              <p className="text-gray-600">No scheduled videos found.</p>
            ) : (
              <ul className="space-y-8">
                {scheduledVideos.map((video) => (
                  <li key={video.id} className="bg-gray-50 p-6 rounded-lg shadow-md">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{video.title || video.filename}</h3>
                        <p className="text-sm text-gray-500 mb-2">Scheduled for: {new Date(video.scheduled_date).toLocaleString()}</p>
                        <p className="text-sm font-medium text-blue-500">Status: Scheduled</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-lg font-medium text-gray-700 mb-2">Description:</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">{video.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}