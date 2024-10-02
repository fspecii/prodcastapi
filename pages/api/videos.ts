import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { getVideos, deleteVideo } from '../../lib/db';
import axios from 'axios';

let checkInterval: NodeJS.Timeout | null = null;

function startPeriodicCheck() {
  if (checkInterval) {
    clearInterval(checkInterval);
  }
  checkInterval = setInterval(async () => {
    try {
      console.log('Running periodic check for scheduled and bulk videos');
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/check-scheduled-videos`);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/process-bulk-video`);
      console.log('Periodic check completed');
    } catch (error) {
      console.error('Error during periodic check:', error);
    }
  }, 5 * 60 * 1000); // Run every 5 minutes
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const videosDir = path.join(process.cwd(), 'public', 'videos');

  if (req.method === 'GET') {
    try {
      const { published, scheduled } = req.query;
      const videos = await getVideos();
      if (published === 'true') {
        const publishedVideos = videos.filter(video => video.published && video.status === 'published');
        res.status(200).json(publishedVideos);
      } else if (scheduled === 'true') {
        const scheduledVideos = videos.filter(video => video.scheduled && video.status === 'scheduled');
        res.status(200).json(scheduledVideos);
      } else {
        res.status(200).json(videos);
      }

      // Start the periodic check if it's not already running
      if (!checkInterval) {
        console.log('Starting periodic check');
        startPeriodicCheck();
      }
    } catch (error) {
      res.status(500).json({ error: 'Error fetching videos' });
    }
  } else if (req.method === 'DELETE') {
    const { id, filename } = req.query;
    if (typeof id !== 'string' || typeof filename !== 'string') {
      return res.status(400).json({ error: 'Invalid request' });
    }
    try {
      await deleteVideo(parseInt(id));
      const filePath = path.join(videosDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting video' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}