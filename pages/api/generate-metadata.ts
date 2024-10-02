import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { getVideoTranscriptionPath, updateVideoMetadata } from '../../lib/db';

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds

function extractJSONFromText(text: string): any {
  const jsonRegex = /{[\s\S]*}/;
  const match = text.match(jsonRegex);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (error) {
      console.error('Failed to parse extracted JSON:', error);
    }
  }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({ error: 'Missing video ID' });
  }

  try {
    const transcriptionPath = await getVideoTranscriptionPath(parseInt(videoId));
    if (!transcriptionPath) {
      return res.status(404).json({ error: 'Transcription not found for this video' });
    }

    const fullTranscriptionPath = path.join(process.cwd(), 'public', transcriptionPath);
    const transcriptionData = JSON.parse(fs.readFileSync(fullTranscriptionPath, 'utf-8'));
    const transcription = transcriptionData.words.map((w: any) => w.word).join(' ');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `Based on the following transcription, generate a catchy title and description for a YouTube video for the channel "Smart and Crazy". The response should be in JSON format with 'title' and 'description' fields. Keep the title under 100 characters and the description under 5000 characters.

Transcription:
${transcription}

Please provide the response in the following JSON format:
{
  "title": "Your generated title here",
  "description": "Your generated description here"
}`;

    let metadata = null;
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        const result = await model.generateContent(prompt);
        const generatedText = result.response.text().trim();
        console.log('Raw Gemini response:', generatedText);

        try {
          metadata = JSON.parse(generatedText);
        } catch (parseError) {
          console.error('Failed to parse JSON, attempting to extract:', parseError);
          metadata = extractJSONFromText(generatedText);
        }

        if (metadata && metadata.title && metadata.description) {
          break;
        } else {
          throw new Error('Invalid metadata format');
        }
      } catch (error) {
        console.error(`Error generating metadata (attempt ${retries + 1}):`, error);
        retries++;
        if (retries < MAX_RETRIES) {
          console.log(`Waiting ${RETRY_DELAY / 1000} seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          throw error;
        }
      }
    }

    if (!metadata || !metadata.title || !metadata.description) {
      throw new Error('Failed to generate valid metadata after multiple attempts');
    }

    // Save the generated metadata to the database
    await updateVideoMetadata(parseInt(videoId), metadata.title, metadata.description);
    console.log('Metadata saved to database');

    res.status(200).json({ message: 'Metadata generated and saved successfully', metadata });
  } catch (error) {
    console.error('Error generating metadata:', error);
    res.status(500).json({ error: 'Error generating metadata' });
  }
}