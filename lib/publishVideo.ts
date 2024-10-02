import { updateVideoStatus } from './db';
import axios from 'axios';

export async function publishVideo(id: number, filename: string) {
  try {
    // Implement the video publishing logic here
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-to-youtube`, {
      videoPath: `/videos/${filename}`,
      title: 'Your video title', // You might want to fetch this from the database
      description: 'Your video description' // You might want to fetch this from the database
    });

    if (res.data.success) {
      // Update the video status when done
      await updateVideoStatus(id, 'published', res.data.videoUrl, true, false);
      console.log(`Video ${id} published successfully`);
    } else {
      throw new Error('Failed to upload video to YouTube');
    }
  } catch (error) {
    console.error(`Error publishing video ${id}:`, error);
    await updateVideoStatus(id, 'failed', null, false, false);
  }
}