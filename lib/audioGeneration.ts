import axios from 'axios';

export async function generateAudioFromYouTube(youtubeUrl: string) {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/generate-audio`, {
      youtubeUrl,
      template: 'podcast',
      speaker1Voice: 'aura-asteria-en',
      speaker2Voice: 'aura-arcas-en',
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error generating audio from YouTube:', error);
    throw error;
  }
}