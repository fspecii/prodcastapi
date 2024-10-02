import { NextApiRequest, NextApiResponse } from 'next';
import { getScheduledVideos } from '../../lib/db';
import { publishVideo } from '../../lib/publishVideo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const scheduledVideos = await getScheduledVideos();
    for (const video of scheduledVideos) {
      console.log(`Publishing scheduled video: ${video.id}`);
      await publishVideo(video.id, video.filename);
    }
    res.status(200).json({ message: 'Scheduled videos checked and processed' });
  } catch (error) {
    console.error('Error checking and publishing scheduled videos:', error);
    res.status(500).json({ error: 'Failed to process scheduled videos' });
  }
}