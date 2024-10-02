import { NextApiRequest, NextApiResponse } from 'next';
import { getPendingBulkVideos, updateBulkVideoStatus, addVideo } from '../../lib/db';
import { generateAudioFromYouTube } from '../../lib/audioGeneration';
import { generateVideo } from '../../lib/videoGeneration';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Starting bulk video processing check');

  const pendingVideos = await getPendingBulkVideos();

  if (pendingVideos.length === 0) {
    console.log('No pending videos to process');
    return res.status(200).json({ message: 'No pending videos to process' });
  }

  const video = pendingVideos[0];
  console.log(`Processing bulk video: ${video.id} - ${video.youtube_url}`);

  try {
    // Update status to processing
    await updateBulkVideoStatus(video.id, 'processing');
    console.log(`Updated status to processing for video ${video.id}`);

    // Generate audio
    console.log(`Generating audio for video ${video.id}`);
    const audioData = await generateAudioFromYouTube(video.youtube_url);
    console.log(`Audio generated for video ${video.id}`);

    // Generate video
    console.log(`Generating video for ${video.id}`);
    const videoData = await generateVideo(audioData.tempFileName, audioData.audioFileName, audioData.audioDuration);
    console.log(`Video generated for ${video.id}`);

    // Add video to database
    console.log(`Adding video ${video.id} to database`);
    await addVideo(videoData.videoUrl.split('/').pop() || '', audioData.transcriptionPath, 'completed');
    console.log(`Video ${video.id} added to database`);

    // Update bulk video status to completed
    await updateBulkVideoStatus(video.id, 'completed');
    console.log(`Updated status to completed for video ${video.id}`);

    res.status(200).json({ message: 'Video processed successfully', videoId: video.id });
  } catch (error) {
    console.error(`Error processing video ${video.id}:`, error);
    await updateBulkVideoStatus(video.id, 'failed');
    res.status(500).json({ error: 'Failed to process video', videoId: video.id });
  }
}