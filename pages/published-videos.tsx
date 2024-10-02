import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import '../app/globals.css';

interface Video {
  id: number;
  filename: string;
  created_at: string;
  published: boolean;
  scheduled: boolean;
  status: string;
  video_url: string | null;
  title: string;
  description: string;
}

export default function PublishedVideos() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    fetchPublishedVideos();
  }, []);

  const fetchPublishedVideos = async () => {
    const res = await fetch('/api/videos?published=true');
    const data = await res.json();
    setVideos(data.filter((video: Video) => video.published && video.status === 'published'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Published Videos</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Published Videos
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            View your published YouTube videos.
          </p>
          <Link href="/videos" className="mt-4 inline-block bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200">
            Back to Manage Videos
          </Link>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Published Videos</h2>
            {videos.length === 0 ? (
              <p className="text-gray-600">No published videos found.</p>
            ) : (
              <ul className="space-y-8">
                {videos.map((video) => (
                  <li key={video.id} className="bg-gray-50 p-6 rounded-lg shadow-md">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{video.title || video.filename}</h3>
                        <p className="text-sm text-gray-500 mb-2">Published on: {new Date(video.created_at).toLocaleString()}</p>
                        <p className="text-sm font-medium text-green-500">Status: Published</p>
                      </div>
                      <div className="flex flex-col space-y-2 md:space-y-0 md:space-x-2 md:flex-row">
                        {video.video_url && (
                          <a
                            href={video.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-500 text-white rounded-md px-4 py-2 text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
                          >
                            View on YouTube
                          </a>
                        )}
                        <button
                          onClick={() => {/* TODO: Implement LLM description generation */}}
                          className="bg-purple-500 text-white rounded-md px-4 py-2 text-sm hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-200"
                        >
                          Generate New Description
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-lg font-medium text-gray-700 mb-2">Description:</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">{video.description}</p>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-lg font-medium text-gray-700 mb-2">LLM-Generated Description:</h4>
                      <p className="text-gray-600 italic">
                        {video.llmDescription || "No LLM-generated description available yet. Click 'Generate New Description' to create one."}
                      </p>
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