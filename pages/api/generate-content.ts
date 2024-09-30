import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { BingImageSearch } from '../../utils/BingImageSearch';
import axios from 'axios';

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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

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
  const imageQueriesPrompt = `Based on the following podcast transcript, generate 10 short, specific image search queries that represent key visual elements or concepts discussed. If the transcript is too short or lacks context, create generic queries related to podcasting or conversations:

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
        .slice(0, 10);

      if (searchQueries.length < 10) {
        const defaultQueries = [
          "podcast microphone",
          "people having deep conversation",
          "emotional revelation moment",
          "introspective person thinking",
          "group of friends talking",
          "scientific discovery visualization",
          "technology and human interaction",
          "nature and science connection",
          "futuristic concept art",
          "abstract representation of ideas"
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
          "group of friends talking",
          "scientific discovery visualization",
          "technology and human interaction",
          "nature and science connection",
          "futuristic concept art",
          "abstract representation of ideas"
        ];
      }
    }
  }

  // Generate a single diagram description
  const diagramPrompt = `Based on the following podcast transcript, generate a single, detailed diagram description that visualizes the main concept or process discussed. The diagram should be directly related to the content of the transcript. Be specific and use concepts mentioned in the transcript.

Transcript:
${transcript}

Please provide a single, detailed diagram description in the following JSON format:

{
  "type": "flowchart",
  "title": "Main Concept of the Podcast",
  "description": "A detailed description of what the diagram shows, relating it to the transcript content",
  "elements": [
    {
      "id": "start",
      "text": "Starting point of the concept",
      "connections": ["next_element_id"]
    },
    {
      "id": "element_2",
      "text": "Second key point or concept",
      "connections": ["element_3", "element_4"]
    },
    {
      "id": "element_3",
      "text": "Third key point or concept",
      "connections": ["conclusion"]
    },
    {
      "id": "element_4",
      "text": "Fourth key point or concept",
      "connections": ["conclusion"]
    },
    {
      "id": "conclusion",
      "text": "Concluding point or concept",
      "connections": []
    }
  ]
}

Ensure the diagram has at least 5 elements and that the content is directly related to the transcript. The 'connections' array should contain the IDs of the elements that logically follow in the diagram.`;

  let diagramDescription: any = null;
  const maxDiagramRetries = 3;

  for (let attempt = 0; attempt < maxDiagramRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1} to generate diagram`);
      const diagramResult = await model.generateContent(diagramPrompt);
      const diagramText = diagramResult.response.text().trim();
      console.log('Raw diagram response:', diagramText);
      
      // Attempt to parse the JSON response
      const startIndex = diagramText.indexOf('{');
      const endIndex = diagramText.lastIndexOf('}') + 1;
      const jsonString = diagramText.slice(startIndex, endIndex);
      diagramDescription = JSON.parse(jsonString);
      console.log('Parsed diagram description:', JSON.stringify(diagramDescription, null, 2));

      // Validate the parsed data
      if (!diagramDescription.type || !diagramDescription.title || !diagramDescription.description || !Array.isArray(diagramDescription.elements) || diagramDescription.elements.length < 5) {
        throw new Error('Invalid diagram description structure or insufficient elements');
      }

      // If we reach here, the data is valid
      console.log('Valid diagram description generated');
      break;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed for diagram generation:`, error);
      if (attempt === maxDiagramRetries - 1) {
        // If all attempts fail, use a default diagram
        console.warn('Using default diagram due to generation failure');
        diagramDescription = {
          type: "flowchart",
          title: "Key Concepts from the Podcast",
          description: "A flowchart showing the main topics discussed in the podcast",
          elements: [
            { id: "start", text: "Podcast Introduction", connections: ["topic1"] },
            { id: "topic1", text: "Main Topic 1", connections: ["topic2"] },
            { id: "topic2", text: "Main Topic 2", connections: ["topic3"] },
            { id: "topic3", text: "Main Topic 3", connections: ["topic4"] },
            { id: "topic4", text: "Main Topic 4", connections: ["conclusion"] },
            { id: "conclusion", text: "Podcast Conclusion", connections: [] }
          ]
        };
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
      3,  // increase to 3 images per query
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

  // Shuffle the images to get a random selection
  const shuffledImages = allDownloadedImages.sort(() => 0.5 - Math.random());

  // Select up to 15 images
  const selectedImages = shuffledImages.slice(0, 15);

  // Log the final diagramDescription before sending the response
  console.log('Final diagramDescription:', JSON.stringify(diagramDescription, null, 2));

  // After generating the diagramDescription
  let diagramUrl = '';
  try {
    const diagramResponse = await axios.post('http://localhost:3000/api/generate-diagram', { diagramDescription });
    diagramUrl = diagramResponse.data.diagramUrl;
  } catch (error) {
    console.error('Error generating diagram PNG:', error);
  }

  // Return headlines, downloaded images, diagram description, and sessionId
  res.status(200).json({ 
    headlines, 
    images: selectedImages.map(img => `/temp/${sessionId}/${img}`),
    diagramDescription,
    diagramUrl,
    sessionId 
  });
}