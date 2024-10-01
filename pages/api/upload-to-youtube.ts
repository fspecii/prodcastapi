import { NextApiRequest, NextApiResponse } from 'next';
import { upload } from 'youtube-videos-uploader';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoPath, title, description } = req.body;

  if (!videoPath || !title || !description) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const credentials = {
    email: process.env.YOUTUBE_EMAIL,
    pass: process.env.YOUTUBE_PASSWORD,
    recoveryemail: process.env.YOUTUBE_RECOVERY_EMAIL
  };

  if (!credentials.email || !credentials.pass || !credentials.recoveryemail) {
    return res.status(500).json({ error: 'YouTube credentials not configured' });
  }

  const fullVideoPath = path.join(process.cwd(), 'public', videoPath);

  if (!fs.existsSync(fullVideoPath)) {
    return res.status(404).json({ error: 'Video file not found' });
  }

  const video = {
    path: fullVideoPath,
    title: title,
    description: description,
    language: 'english',
    tags: ['generated', 'ai', 'podcast'],
    onSuccess: (videoUrl: string) => {
      console.log(`Video uploaded successfully: ${videoUrl}`);
    },
    onProgress: (progress: number) => {
      console.log(`Upload progress: ${progress}%`);
    }
  };

  try {
    const result = await upload(credentials, [video], { headless: true });
    res.status(200).json({ success: true, videoUrl: result[0] });
  } catch (error) {
    console.error('Error uploading video to YouTube:', error);
    res.status(500).json({ error: 'Failed to upload video to YouTube' });
  }
}