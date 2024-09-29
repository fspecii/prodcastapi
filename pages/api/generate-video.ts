import { NextApiRequest, NextApiResponse } from 'next';
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tempFileName, audioFileName, audioDuration } = req.body;

  if (!tempFileName || !audioFileName || !audioDuration) {
    return res.status(400).json({ error: 'Temporary file name, audio file name, and audio duration are required' });
  }

  try {
    console.log('Starting video generation process');
    console.log('Audio duration:', audioDuration);
    
    // Read the transcription data from the temporary file
    const tempFilePath = path.join(process.cwd(), 'temp', tempFileName);
    const transcriptionData = JSON.parse(fs.readFileSync(tempFilePath, 'utf-8'));

    console.log('Transcription data loaded. Last word end time:', 
      transcriptionData.words[transcriptionData.words.length - 1].end);

    const bundleLocation = await bundle(path.resolve('./remotion/index.ts'));
    console.log('Bundle created');

    const inputProps = {
      transcription: transcriptionData,
      audioFileName,
      audioDuration: parseFloat(audioDuration),
    };

    console.log('Getting compositions');
    const comps = await getCompositions(bundleLocation, { inputProps });
    console.log(`Found ${comps.length} compositions`);
    
    const video = comps.find((c) => c.id === "MyComp");

    if (!video) {
      throw new Error("Composition not found");
    }

    const fps = video.fps;
    const durationInFrames = Math.ceil(parseFloat(audioDuration) * fps);

    console.log(`Video composition found. Setting duration to ${durationInFrames} frames (${audioDuration} seconds)`);

    const outputDir = path.resolve('./public/videos');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFilename = `video-${Date.now()}.mp4`;
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
    });

    console.log(`Video rendering completed. Actual duration: ${durationInFrames} frames (${audioDuration} seconds)`);

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);

    const videoUrl = `/videos/${outputFilename}`;
    res.status(200).json({ videoUrl });
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ error: 'Error generating video', details: error instanceof Error ? error.message : String(error) });
  }
}