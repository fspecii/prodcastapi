Our goal it's to create a nextjs api that will transcribe and audio file sent by a user using deepgram api. then we will use the transcription from the json to generate a video with caption using remotion and deliver the video to the user.

here is an example of how to use deepgram api to transcribe an audio file:
const { createClient } = require("@deepgram/sdk");
const fs = require("fs");

const transcribeFile = async () => {
  // STEP 1: Create a Deepgram client using the API key
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

  // STEP 2: Call the transcribeFile method with the audio payload and options
  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    fs.readFileSync("youraudiofile.wav"),
    // STEP 3: Configure Deepgram options for audio analysis
    {
      model: "nova-2",
      sentiment: true,
    }
  );

  if (error) throw error;
  // STEP 4: Print the results
  if (!error) console.dir(result, { depth: null });
};

transcribeFile();

first create the .env file and create the api to do the transcription.
