import { NextApiRequest, NextApiResponse } from 'next';
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from 'fs';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { audioFileName, audioDuration, transcript, words } = req.body;

  if (!audioFileName || !audioDuration) {
    return res.status(400).json({ error: 'Audio file name and duration are required' });
  }

  try {
    console.log('Starting video generation process');
    console.log('Audio duration:', audioDuration);
    
    // Generate content (headlines and images)
    const contentResponse = await axios.post('http://localhost:3000/api/generate-content', {
      transcript: transcript
    });
    const { headlines, images, sessionId } = contentResponse.data;

    const bundleLocation = await bundle(path.resolve('./remotion/index.ts'));
    console.log('Bundle created');

    const inputProps = {
      transcription: { words },
      audioFileName,
      audioDuration: parseFloat(audioDuration),
      headlines,
      images: images.map((img: string) => img.replace('/public/', '')) // Remove '/public/' from the path
    };

    console.log('generate-video: Input props:', inputProps);

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

    const outputFilename = `video-${Date.now()}.mp4`;
    const outputLocation = path.join(outputDir, outputFilename);

    console.log(`Rendering video to ${outputLocation}`);

    await renderMedia({
      composition: video,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation,
      inputProps,
    });

    console.log(`Video rendering completed. Actual duration: ${durationInFrames} frames (${audioDuration} seconds)`);

    // Clean up the temporary files
    const tempImageDir = path.join(process.cwd(), 'public', 'temp', sessionId);
    fs.rmSync(tempImageDir, { recursive: true, force: true });

    const videoUrl = `/videos/${outputFilename}`;
    res.status(200).json({ videoUrl });
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ error: 'Error generating video', details: error instanceof Error ? error.message : String(error) });
  }
}