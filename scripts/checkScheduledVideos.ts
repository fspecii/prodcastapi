import { getScheduledVideos } from '../lib/db';
import { publishVideo } from '../lib/publishVideo';

async function checkAndPublishScheduledVideos() {
  try {
    const scheduledVideos = await getScheduledVideos();
    for (const video of scheduledVideos) {
      console.log(`Publishing scheduled video: ${video.id}`);
      await publishVideo(video.id, video.filename);
    }
  } catch (error) {
    console.error('Error checking and publishing scheduled videos:', error);
  }
}

// Run the check
checkAndPublishScheduledVideos();