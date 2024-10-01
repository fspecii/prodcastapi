import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@deepgram/sdk';
import yt_dlp from 'yt-dlp-exec';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { INSTRUCTION_TEMPLATES } from '../../templates';
import { getAudioDurationInSeconds } from 'get-audio-duration';
import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import axios from 'axios'; // Add this import

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
if (!DEEPGRAM_API_KEY) {
  throw new Error('DEEPGRAM_API_KEY is not set in the environment variables');
}
const deepgram = createClient(DEEPGRAM_API_KEY);

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error('GEMINI_API_KEY is not set in the environment variables');
}
const genAI = new GoogleGenerativeAI(geminiApiKey);

async function downloadYoutubeAudio(youtubeUrl: string): Promise<string> {
  console.log(`[DEBUG] Downloading YouTube audio from: ${youtubeUrl}`);
  const outputDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, `${uuidv4()}.mp3`);

  try {
    await yt_dlp(youtubeUrl, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: outputFile,
    });
    console.log(`[DEBUG] YouTube audio downloaded to: ${outputFile}`);
    return outputFile;
  } catch (error) {
    console.error('[ERROR] Error downloading YouTube audio:', error);
    throw error;
  }
}

async function transcribeAudio(audioFilePath: string): Promise<any> {
  console.log(`[DEBUG] Transcribing audio file: ${audioFilePath}`);
  try {
    const audioBuffer = fs.readFileSync(audioFilePath);
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(audioBuffer, {
      model: 'nova-2',
      diarize: true,
      sentiment: true,
    });

    if (error) {
      console.error('[ERROR] Deepgram transcription error:', error);
      throw error;
    }

    console.log('[DEBUG] Deepgram transcription result:', JSON.stringify(result, null, 2));

    // Get audio duration
    const audioDuration = await getAudioDurationInSeconds(audioFilePath);

    // Process the result to match the expected format
    const processedResult = {
      transcript: result.results.channels[0].alternatives[0].transcript,
      words: result.results.channels[0].alternatives[0].words.map((word: any) => ({
        ...word,
        speaker: word.speaker || 0, // Ensure speaker is always defined
      })),
      audioFileName: path.basename(audioFilePath),
      audioDuration,
    };

    console.log('[DEBUG] Processed transcription result:', JSON.stringify(processedResult, null, 2));
    return processedResult;
  } catch (error) {
    console.error('[ERROR] Error transcribing audio:', error);
    throw error;
  }
}

async function generateDialogue(transcript: string, template: any): Promise<string> {
  console.log('[DEBUG] Generating dialogue using Gemini');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    ${template.intro}

    Here is the original input text:

    <input_text>
    ${transcript}
    </input_text>

    ${template.text_instructions}

    <scratchpad>
    ${template.scratch_pad}
    </scratchpad>

    ${template.prelude}

    <podcast_dialogue>
    ${template.dialog}
    </podcast_dialogue>

    Please format your response as follows:
    **Scratchpad**
    Your scratchpad content here

    **Dialogue**
    speaker-1: Speaker 1's dialogue
    speaker-2: Speaker 2's dialogue
    Continue alternating between speaker-1 and speaker-2 for at least 40 exchanges
  `;

  console.log('[DEBUG] Gemini prompt:', prompt);

  const result = await model.generateContent(prompt);
  const generatedDialogue = result.response.text();
  console.log('[DEBUG] Generated dialogue from Gemini:', generatedDialogue);
  return generatedDialogue;
}

async function extendDialogue(dialogue: string): Promise<string> {
  console.log('[DEBUG] Extending dialogue');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const extendPrompt = `
    The previous response was too short or not in the correct format. Please extend and reformat the following content:

    ${dialogue}

    Ensure that:
    1. The dialogue has at least 50 exchanges.
    2. Speakers alternate between speaker-1 and speaker-2.
    3. Each line starts with either 'speaker-1:' or 'speaker-2:'.
    4. Do not use any other speaker labels.
  `;

  const result = await model.generateContent(extendPrompt);
  const extendedDialogue = result.response.text();
  console.log('[DEBUG] Extended dialogue:', extendedDialogue);
  return extendedDialogue;
}

async function reformatDialogue(dialogue: string): Promise<string> {
  console.log('[DEBUG] Reformatting dialogue using Gemini');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const reformat_prompt = `
    Please reformat the following dialogue to ensure consistent speaker labeling and proper formatting:

    ${dialogue}

    Rules for reformatting:
    1. Use "Speaker-1:" and "Speaker-2:" consistently for speaker labels.
    2. Each speaker's dialogue should be on a new line.
    3. Remove any unnecessary formatting or markdown syntax.
    4. Ensure proper capitalization and punctuation. Convert all uppercase words to lowercase (e.g., change 'EXAMPLE' to 'example') except for names, which should start with an uppercase letter. Words like 'ChatGPT-like' should be changed to 'chat gpt like'.
    5. Maintain the original content and meaning of the dialogue but significantly expand and improve it. Aim for at least 100 dialogue exchanges, adding depth, detail, and engaging content to each topic discussed.
    6. Make sure the script doesn't contain any details like (sarcastic), (smile), (laughing) or any other additional instructions, only the dialogue.
    7. Ensure Sarah is Speaker-1 and John is Speaker-2.
    8. Elaborate on complex topics, adding examples, analogies, and real-world applications to make the content more engaging and informative.
    9. Introduce new, relevant subtopics that naturally flow from the main discussion to create a richer, more comprehensive dialogue.
    10. Incorporate elements of debate or friendly disagreement between Sarah and John to add dynamism to the conversation.
    11. Ensure a balance between scientific accuracy (from Sarah) and skeptical questioning (from John) throughout the extended dialogue.
    12. Add occasional callbacks to earlier points in the conversation to create a more cohesive and interconnected discussion.
    13. Include thought-provoking questions or hypothetical scenarios to encourage listener engagement.
    14. Maintain a consistent tone and pacing throughout the extended dialogue, ensuring it remains engaging from start to finish.
    15. Place the outro at the end of the dialogue, ensuring no additional content follows it.
    16. Remove any quotation marks from the script.
    17. Expand the dialogue within the main body of the conversation, not after the outro.
    Provide only the reformatted and expanded dialogue without any additional comments.
  `;

  console.log('[DEBUG] Reformat prompt:', reformat_prompt);

  const result = await model.generateContent(reformat_prompt);
  const reformattedDialogue = result.response.text();
  console.log('[DEBUG] Reformatted dialogue:', reformattedDialogue);
  return reformattedDialogue;
}

async function generateAudio(text: string, voice: string): Promise<string> {
  console.log(`[DEBUG] Generating audio for voice: ${voice}`);
  try {
    const response = await deepgram.speak.request(
      { text },
      {
        model: voice,
        encoding: 'linear16',
        container: 'wav',
      }
    );

    const stream = await response.getStream();
    if (stream) {
      const tempFile = path.join(process.cwd(), 'temp', `${uuidv4()}.wav`);
      await new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(tempFile);
        const readableStream = Readable.from(stream);
        readableStream.pipe(fileStream);
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
      });
      return tempFile;
    } else {
      throw new Error('Error generating audio: No stream returned');
    }
  } catch (error) {
    console.error('[ERROR] Error generating audio:', error);
    throw error;
  }
}

async function combineAudioFiles(audioFiles: string[], outputFile: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = ffmpeg();
    audioFiles.forEach(file => {
      command.input(file);
    });
    command
      .on('end', () => {
        console.log('[DEBUG] Audio files combined successfully');
        resolve();
      })
      .on('error', (err) => {
        console.error('[ERROR] Error combining audio files:', err);
        reject(err);
      })
      .mergeToFile(outputFile, path.dirname(outputFile));
  });
}

async function generateScript(subject: string): Promise<string> {
  console.log('[DEBUG] Generating script using Gemini');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const scriptTemplate = INSTRUCTION_TEMPLATES.scriptWriter;
  const prompt = `
    ${scriptTemplate.intro}

    Subject: ${subject}

    ${scriptTemplate.instructions}

    ${scriptTemplate.outro}

    Please write the script now.
  `;

  console.log('[DEBUG] Script generation prompt:', prompt);

  const result = await model.generateContent(prompt);
  const generatedScript = result.response.text();
  console.log('[DEBUG] Generated script:', generatedScript);
  return generatedScript;
}

async function generateVideo(transcription: any, audioFileName: string, audioDuration: number): Promise<string> {
  try {
    const response = await axios.post('http://localhost:3000/api/generate-video', {
      transcription,
      audioFileName,
      audioDuration,
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data.videoUrl;
  } catch (error) {
    console.error('[ERROR] Error generating video:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[DEBUG] Received request:', req.body);

  try {
    const { text, youtubeUrl, subject, template, speaker1Voice, speaker2Voice } = req.body;

    let initialTranscript: string;
    if (youtubeUrl) {
      console.log('[DEBUG] Processing YouTube URL');
      const audioFilePath = await downloadYoutubeAudio(youtubeUrl);
      const transcriptionResult = await transcribeAudio(audioFilePath);
      initialTranscript = transcriptionResult.transcript;
      fs.unlinkSync(audioFilePath); // Clean up the temporary audio file
    } else if (text) {
      console.log('[DEBUG] Processing text input');
      initialTranscript = text;
    } else if (subject) {
      console.log('[DEBUG] Generating script from subject');
      initialTranscript = await generateScript(subject);
    } else {
      throw new Error('Either text, youtubeUrl, or subject must be provided');
    }

    console.log('[DEBUG] Generating dialogue');
    let dialogue = await generateDialogue(initialTranscript, INSTRUCTION_TEMPLATES[template || 'podcast']);
    
    // Parse and check dialogue length
    let dialogueItems = dialogue.split('\n').filter(line => line.startsWith('speaker-1:') || line.startsWith('speaker-2:'));
    if (dialogueItems.length < 20) {
      console.log('[DEBUG] Dialogue is too short. Attempting to extend.');
      dialogue = await extendDialogue(dialogue);
      dialogueItems = dialogue.split('\n').filter(line => line.startsWith('speaker-1:') || line.startsWith('speaker-2:'));
    }

    console.log('[DEBUG] Reformatting dialogue');
    const reformattedDialogue = await reformatDialogue(dialogue);

    const audioFiles: string[] = [];
    let transcript = '';

    for (const line of dialogueItems) {
      const [speaker, text] = line.split(':', 2);
      const voice = speaker.trim() === 'speaker-1' ? speaker1Voice : speaker2Voice;
      const audioFile = await generateAudio(text.trim(), voice);
      audioFiles.push(audioFile);
      transcript += `${speaker}: ${text.trim()}\n\n`;
    }

    const outputDir = path.join(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, `${uuidv4()}.wav`);
    await combineAudioFiles(audioFiles, outputFile);

    // Clean up temporary audio files
    audioFiles.forEach(file => fs.unlinkSync(file));

    console.log(`[DEBUG] Combined audio saved to: ${outputFile}`);

    // Calculate the total duration of the generated audio
    const audioDuration = await getAudioDurationInSeconds(outputFile);
    console.log(`[DEBUG] Generated audio duration: ${audioDuration} seconds`);

    // Transcribe the generated dialogue using Deepgram
    console.log('[DEBUG] Transcribing generated dialogue');
    const finalTranscriptionResult = await transcribeAudio(outputFile);

    const audioFileName = path.basename(outputFile);
    const audioUrl = `/audio/${audioFileName}`;

    // Save transcription to a temporary file
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempFileName = `transcription_${Date.now()}.json`;
    const tempFilePath = path.join(tempDir, tempFileName);
    fs.writeFileSync(tempFilePath, JSON.stringify(finalTranscriptionResult));

    res.status(200).json({ 
      audioUrl,
      tempFileName,
      audioFileName,
      audioDuration,
      transcript: finalTranscriptionResult.transcript,
    });
  } catch (error) {
    console.error('[ERROR] Error processing request:', error);
    res.status(500).json({ 
      error: 'Error processing request', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}