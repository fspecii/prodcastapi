import React from 'react';
import { Composition } from "remotion";
import { MyComp } from "./MyComp";
import { Transcription } from "./types";

export const RemotionRoot: React.FC<{ transcription?: Transcription; audioFileName?: string; audioDuration?: number; headlines?: string[]; images?: string[] }> = ({ transcription, audioFileName, audioDuration, headlines, images }) => {
  const fps = 30;
  const durationInFrames = Math.max(Math.ceil((audioDuration || 0) * fps), 1); // Ensure at least 1 frame

  console.log('RemotionRoot: Received props:', { transcription, audioFileName, audioDuration, headlines, images });

  return (
    <Composition
      id="MyComp"
      component={MyComp}
      durationInFrames={durationInFrames}
      fps={fps}
      width={1920}
      height={1080}
      defaultProps={{
        transcription: transcription || {} as Transcription,
        audioFileName: audioFileName || "",
        audioDuration: audioDuration || 0,
        headlines: headlines || [],
        images: images || []
      }}
    />
  );
};