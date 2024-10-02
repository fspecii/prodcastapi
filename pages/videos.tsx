import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
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
  scheduled_date?: string;
  renderProgress?: number;
}

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchVideos();
    const interval = setInterval(fetchVideos, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
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

  const publishVideo = async (id: number, filename: string) => {
    try {
      const res = await fetch('/api/publish-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, filename }),
      });
      if (res.ok) {
        alert('Video published successfully');
        fetchVideos();
      } else {
        throw new Error('Failed to publish video');
      }
    } catch (error) {
      console.error('Error publishing video:', error);
      alert('Error publishing video');
    }
  };

  const openScheduleModal = (video: Video) => {
    setSelectedVideo(video);
    setScheduledDate(null);
    setShowScheduleModal(true);
  };

  const scheduleVideo = async () => {
    if (!selectedVideo || !scheduledDate) return;

    try {
      const res = await fetch('/api/schedule-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: selectedVideo.id, 
          filename: selectedVideo.filename, 
          scheduledDate: scheduledDate.toISOString() 
        }),
      });
      if (res.ok) {
        alert('Video scheduled successfully');
        setShowScheduleModal(false);
        fetchVideos();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to schedule video');
      }
    } catch (error) {
      console.error('Error scheduling video:', error);
      alert(error instanceof Error ? error.message : 'Error scheduling video');
    }
  };

  const stopRendering = async (id: number) => {
    if (confirm('Are you sure you want to stop the rendering process?')) {
      try {
        const res = await fetch(`/api/stop-rendering`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        if (res.ok) {
          alert('Rendering process stopped');
          fetchVideos();
        } else {
          throw new Error('Failed to stop rendering process');
        }
      } catch (error) {
        console.error('Error stopping rendering:', error);
        alert('Error stopping rendering process');
      }
    }
  };

  const generateMetadata = async (id: number) => {
    try {
      const res = await fetch('/api/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: id }),
      });
      if (res.ok) {
        alert('Metadata generated successfully');
        fetchVideos();
      } else {
        throw new Error('Failed to generate metadata');
      }
    } catch (error) {
      console.error('Error generating metadata:', error);
      alert('Error generating metadata');
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
          <div className="mt-4 space-x-4">
            <Link href="/" className="inline-block bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200">
              Back to Home
            </Link>
            <Link href="/published-videos" className="inline-block bg-green-500 text-white rounded-md px-4 py-2 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200">
              View Published Videos
            </Link>
            <Link href="/scheduled-videos" className="inline-block bg-yellow-500 text-white rounded-md px-4 py-2 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition duration-200">
              View Scheduled Videos
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Videos</h2>
            {videos.length === 0 ? (
              <p className="text-gray-600">No videos found.</p>
            ) : (
              <ul className="space-y-8">
                {videos.map((video) => (
                  <li key={video.id} className="bg-gray-50 p-6 rounded-md shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{video.title || video.filename}</h3>
                        <p className="text-sm text-gray-500 mb-2">{new Date(video.created_at).toLocaleString()}</p>
                        <p className="text-sm font-medium">
                          Status: 
                          <span className={`ml-2 ${
                            video.status === 'completed' ? 'text-green-500' :
                            video.status === 'processing' ? 'text-yellow-500' :
                            video.status === 'rendering' ? 'text-blue-500' :
                            'text-gray-500'
                          }`}>
                            {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                          </span>
                        </p>
                        {video.published && <span className="text-green-500 text-sm ml-2">Published</span>}
                        {video.scheduled && (
                          <span className="text-blue-500 text-sm ml-2">
                            Scheduled for {new Date(video.scheduled_date!).toLocaleString()}
                          </span>
                        )}
                        {video.status === 'rendering' && video.renderProgress !== undefined && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{width: `${video.renderProgress * 100}%`}}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Rendering Progress: {(video.renderProgress * 100).toFixed(2)}%
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                        {video.video_url && (
                          <a
                            href={video.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-500 text-white rounded-md px-3 py-1 text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
                          >
                            View
                          </a>
                        )}
                        <button
                          onClick={() => publishVideo(video.id, video.filename)}
                          className="bg-green-500 text-white rounded-md px-3 py-1 text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
                          disabled={video.published || video.status !== 'completed'}
                        >
                          Publish
                        </button>
                        <button
                          onClick={() => openScheduleModal(video)}
                          className={`relative ${
                            video.scheduled
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-yellow-500 hover:bg-yellow-600'
                          } text-white rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition duration-200`}
                          disabled={video.scheduled || video.published || video.status !== 'completed'}
                          title={video.scheduled ? `Scheduled for ${new Date(video.scheduled_date!).toLocaleString()}` : ''}
                        >
                          {video.scheduled ? 'Scheduled' : 'Schedule'}
                        </button>
                        <button
                          onClick={() => deleteVideo(video.id, video.filename)}
                          className="bg-red-500 text-white rounded-md px-3 py-1 text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200"
                        >
                          Delete
                        </button>
                        {video.status === 'rendering' && (
                          <button
                            onClick={() => stopRendering(video.id)}
                            className="bg-orange-500 text-white rounded-md px-3 py-1 text-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition duration-200"
                          >
                            Stop Rendering
                          </button>
                        )}
                        <button
                          onClick={() => generateMetadata(video.id)}
                          className="bg-indigo-500 text-white rounded-md px-3 py-1 text-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-200"
                        >
                          Generate Metadata
                        </button>
                      </div>
                    </div>
                    {video.description && (
                      <div className="mt-4">
                        <h4 className="text-lg font-medium text-gray-700 mb-2">Description:</h4>
                        <p className="text-gray-600 whitespace-pre-wrap">{video.description}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {showScheduleModal && selectedVideo && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Schedule Video</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 mb-4">
                  Select a date and time to schedule "{selectedVideo.title || selectedVideo.filename}"
                </p>
                <DatePicker
                  selected={scheduledDate}
                  onChange={(date: Date) => setScheduledDate(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="MMMM d, yyyy h:mm aa"
                  minDate={new Date()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholderText="Click to select a date and time"
                />
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={scheduleVideo}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  disabled={!scheduledDate}
                >
                  Schedule Video
                </button>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}