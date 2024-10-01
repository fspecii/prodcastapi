import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Video {
  id: number;
  filename: string;
  created_at: string;
}

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const res = await fetch('/api/videos');
    const data = await res.json();
    setVideos(data);
  };

  const deleteVideo = async (id: number, filename: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      const res = await fetch(`/api/videos?id=${id}&filename=${filename}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchVideos();
      } else {
        alert('Error deleting video');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Manage Videos</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Manage Videos
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            View and manage your generated videos.
          </p>
          <Link href="/" className="mt-4 inline-block bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200">
            Back to Home
          </Link>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Videos</h2>
            {videos.length === 0 ? (
              <p className="text-gray-600">No videos found.</p>
            ) : (
              <ul className="space-y-4">
                {videos.map((video) => (
                  <li key={video.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">{video.filename}</h3>
                      <p className="text-sm text-gray-500">{new Date(video.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={`/videos/${video.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 text-white rounded-md px-3 py-1 text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
                      >
                        View
                      </a>
                      <button
                        onClick={() => deleteVideo(video.id, video.filename)}
                        className="bg-red-500 text-white rounded-md px-3 py-1 text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200"
                      >
                        Delete
                      </button>
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