import { NextApiRequest, NextApiResponse } from 'next';
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from 'fs';
import axios from 'axios';
import { addVideo, updateVideoStatus, getVideoById } from '../../lib/db';

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tempFileName, audioFileName, audioDuration, videoId } = req.body;

  if ((!tempFileName || !audioFileName || !audioDuration) && !videoId) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  try {
    let transcriptionData, outputFilename, lastID;

    if (videoId) {
      // Retry logic for failed video
      const video = await getVideoById(videoId);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      transcriptionData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', video.transcription_path), 'utf-8'));
      outputFilename = video.filename;
      lastID = videoId;
    } else {
      // New video generation
      console.log('Starting video generation process');
      console.log('Audio duration:', audioDuration);
      
      const tempFilePath = path.join(process.cwd(), 'temp', tempFileName);
      transcriptionData = JSON.parse(fs.readFileSync(tempFilePath, 'utf-8'));

      const transcriptionDir = path.join(process.cwd(), 'public', 'transcriptions');
      if (!fs.existsSync(transcriptionDir)) {
        fs.mkdirSync(transcriptionDir, { recursive: true });
      }
      const transcriptionFilename = `transcription_${Date.now()}.json`;
      const transcriptionPath = path.join(transcriptionDir, transcriptionFilename);
      fs.writeFileSync(transcriptionPath, JSON.stringify(transcriptionData, null, 2));

      outputFilename = `video-${Date.now()}.mp4`;
      const result = await addVideo(outputFilename, `/transcriptions/${transcriptionFilename}`, 'rendering');
      lastID = result.lastID;
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked',
    });
    res.write(JSON.stringify({ videoId: lastID, status: 'rendering' }));

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        await generateVideo(lastID, transcriptionData, audioFileName, audioDuration, outputFilename, res);
        break;
      } catch (error) {
        console.error(`Error during video generation (attempt ${retries + 1}):`, error);
        retries++;
        if (retries < MAX_RETRIES) {
          console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          await updateVideoStatus(lastID, 'failed', null);
          res.write(JSON.stringify({ error: 'Failed to generate video after multiple attempts' }));
          res.end();
        }
      }
    }
  } catch (error) {
    console.error('Video generation error:', error);
    res.write(JSON.stringify({ error: 'Error generating video', details: error instanceof Error ? error.message : String(error) }));
    res.end();
  }
}

async function generateVideo(videoId: number, transcriptionData: any, audioFileName: string, audioDuration: number, outputFilename: string, res: NextApiResponse) {
  console.log('Generating content');
  const contentResponse = await axios.post('http://localhost:3000/api/generate-content', {
    transcript: transcriptionData.words.map((w: any) => w.word).join(' ')
  });
  const { headlines, images, diagramDescription, diagramUrl, sessionId } = contentResponse.data;
  console.log('Content generated successfully');

  await updateVideoStatus(videoId, 'rendering');
  res.write(JSON.stringify({ status: 'rendering' }));

  console.log('Creating bundle');
  const bundleLocation = await bundle(path.resolve('./remotion/index.ts'));
  console.log('Bundle created');

  const inputProps = {
    transcription: transcriptionData,
    audioFileName,
    audioDuration: parseFloat(audioDuration),
    headlines,
    images: images.map((img: string) => img.replace('/public/', '')),
    diagramDescription,
    diagramUrl,
  };

  console.log('Getting compositions');
  const comps = await getCompositions(bundleLocation, { inputProps });
  console.log(`Found ${comps.length} compositions`);
  
  const video = comps.find((c) => c.id === "MyComp");

  if (!video) {
    throw new Error("Composition not found");
  }

  const fps = video.fps;
  const durationInFrames = Math.max(Math.ceil(parseFloat(audioDuration) * fps), 1);

  console.log(`Video composition found. Setting duration to ${durationInFrames} frames (${audioDuration} seconds)`);

  const outputDir = path.resolve('./public/videos');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputLocation = path.join(outputDir, outputFilename);

  console.log(`Rendering video to ${outputLocation}`);

  await renderMedia({
    composition: {
      ...video,
      durationInFrames: durationInFrames
    },
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation,
    inputProps,
    onProgress: async (progress) => {
      console.log(`Rendering progress: ${progress.progress * 100}%`);
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/update-render-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: videoId, progress: progress.progress }),
      });
      res.write(JSON.stringify({ status: 'rendering', progress: progress.progress }));
    },
  });

  console.log(`Video rendering completed. Actual duration: ${durationInFrames} frames (${audioDuration} seconds)`);

  const tempFilePath = path.join(process.cwd(), 'temp', `${videoId}.json`);
  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
  }
  const tempImageDir = path.join(process.cwd(), 'public', 'temp', sessionId);
  fs.rmSync(tempImageDir, { recursive: true, force: true });

  const videoUrl = `/videos/${outputFilename}`;
  
  await updateVideoStatus(videoId, 'completed', videoUrl);

  res.write(JSON.stringify({ status: 'completed', videoUrl }));
  res.end();
}