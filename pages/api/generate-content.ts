import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { BingImageSearch } from '../../utils/BingImageSearch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: 'Missing transcript' });
  }

  console.log('Received transcript:', transcript.substring(0, 200) + '...');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

  // Generate headlines
  const headlinesPrompt = `Based on the following podcast transcript, generate 3 short, catchy headlines that summarize the main topics discussed. If the transcript is too short or lacks context, create generic headlines based on the available information. The headlines must include the main topic of the podcast then the subtopics. These headlines will be shown on the entire video:

${transcript}

Please provide the headlines as a numbered list, one per line.`;

  let headlines: string[] = [];
  try {
    const headlinesResult = await model.generateContent(headlinesPrompt);
    const headlinesText = headlinesResult.response.text().trim();
    console.log('Raw headlines response:', headlinesText);
    
    headlines = headlinesText.split('\n')
      .filter((line: string) => /^\d+\./.test(line))
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 3);

    console.log('Extracted headlines:', headlines);

    if (headlines.length < 3) {
      const defaultHeadlines = [
        "Diving Deep: A Personal Journey",
        "Unexpected Revelations in Our Podcast",
        "Exploring the Depths of Human Experience"
      ];
      headlines = [...headlines, ...defaultHeadlines.slice(headlines.length)];
    }
  } catch (error: unknown) {
    console.error('Error generating headlines:', error);
    headlines = [
      "Diving Deep: A Personal Journey",
      "Unexpected Revelations in Our Podcast",
      "Exploring the Depths of Human Experience"
    ];
  }

  // Generate image search queries
  const imageQueriesPrompt = `Based on the following podcast transcript, generate 5 short, specific image search queries that represent key visual elements or concepts discussed. If the transcript is too short or lacks context, create generic queries related to podcasting or conversations:

${transcript}

Please provide the queries as a numbered list, one per line.`;

  let searchQueries: string[] = [];
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const imageQueriesResult = await model.generateContent(imageQueriesPrompt);
      const responseText = imageQueriesResult.response.text().trim();
      console.log('Gemini response for image queries:', responseText);

      searchQueries = responseText.split('\n')
        .filter((line: string) => /^\d+\./.test(line))
        .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 5);

      if (searchQueries.length < 5) {
        const defaultQueries = [
          "podcast microphone",
          "people having deep conversation",
          "emotional revelation moment",
          "introspective person thinking",
          "group of friends talking"
        ];
        searchQueries = [...searchQueries, ...defaultQueries.slice(searchQueries.length)];
      }
      break;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed for image queries:`, error);
      if (attempt === maxRetries - 1) {
        searchQueries = [
          "podcast microphone",
          "people having deep conversation",
          "emotional revelation moment",
          "introspective person thinking",
          "group of friends talking"
        ];
      }
    }
  }

  // Download images
  const sessionId = uuidv4();
  const outputDir = path.join(process.cwd(), 'public', 'temp', sessionId);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const allDownloadedImages: string[] = [];

  for (const query of searchQueries) {
    console.log(`Processing query: ${query}`);
    const bingSearch = new BingImageSearch(
      query,
      1,  // limit to 1 image per query
      outputDir,
      'moderate',
      30,  // timeout in seconds
      '',  // no filter
      true  // verbose
    );

    try {
      const downloadedImages = await bingSearch.run();
      console.log(`Downloaded images for query "${query}":`, downloadedImages);
      allDownloadedImages.push(...downloadedImages);
    } catch (error) {
      console.error(`Error downloading images for query "${query}":`, error);
    }
  }

  console.log('All downloaded images before sending:', allDownloadedImages);

  // Return headlines, downloaded images, and sessionId
  res.status(200).json({ 
    headlines, 
    images: allDownloadedImages.map(img => `/temp/${sessionId}/${img}`),
    sessionId 
  });
}