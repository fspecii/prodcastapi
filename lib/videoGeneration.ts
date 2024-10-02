import axios from 'axios';

export async function generateVideo(tempFileName: string, audioFileName: string, audioDuration: number) {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/generate-video`, {
      tempFileName,
      audioFileName,
      audioDuration,
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error generating video:', error);
    throw error;
  }
}