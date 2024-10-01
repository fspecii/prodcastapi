import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { getVideos, addVideo, deleteVideo } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const videosDir = path.join(process.cwd(), 'public', 'videos');

  if (req.method === 'GET') {
    try {
      const videos = await getVideos();
      res.status(200).json(videos);
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