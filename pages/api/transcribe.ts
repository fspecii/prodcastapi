import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@deepgram/sdk';
import { IncomingForm, Fields, Files, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { getAudioDurationInSeconds } from 'get-audio-duration';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm();
  form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;
    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    try {
      const deepgram = createClient(process.env.DEEPGRAM_API_KEY as string);
      const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        fs.readFileSync(audioFile.filepath),
        {
          model: 'nova-2',
          diarize: true, // Enable speaker diarization
          sentiment: true,
        }
      );

      if (error) {
        throw error;
      }

      // Save the audio file
      const publicDir = path.join(process.cwd(), 'public');
      const audioDir = path.join(publicDir, 'audio');
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }
      const newAudioFileName = `audio_${Date.now()}.mp3`;
      const newAudioPath = path.join(audioDir, newAudioFileName);
      fs.copyFileSync(audioFile.filepath, newAudioPath);

      // Get audio duration
      const audioDuration = await getAudioDurationInSeconds(newAudioPath);

      // Process the result to match the expected format
      const processedResult = {
        transcript: result.results.channels[0].alternatives[0].transcript,
        words: result.results.channels[0].alternatives[0].words.map((word: any) => ({
          ...word,
          speaker: word.speaker || 0, // Ensure speaker is always defined
        })),
        audioFileName: newAudioFileName,
        audioDuration,
      };

      // Save the full response to a temporary JSON file
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      const tempFileName = `transcription_${Date.now()}.json`;
      const tempFilePath = path.join(tempDir, tempFileName);
      fs.writeFileSync(tempFilePath, JSON.stringify(processedResult, null, 2));

      res.status(200).json({
        tempFileName,
        audioFileName: newAudioFileName,
        audioDuration,
      });
    } catch (error) {
      console.error('Transcription error:', error);
      res.status(500).json({ error: 'Error transcribing audio' });
    }
  });
}