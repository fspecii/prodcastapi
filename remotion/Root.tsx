import React from 'react';
import { Composition } from "remotion";
import { MyComp } from "./MyComp";
import { Transcription } from "./types";

export const RemotionRoot: React.FC<{
  transcription?: Transcription;
  audioFileName?: string;
  audioDuration?: number;
  headlines?: string[];
  images?: string[];
  diagramDescription?: any;
}> = ({
  transcription,
  audioFileName,
  audioDuration,
  headlines,
  images,
  diagramDescription,
}) => {
  const fps = 30;
  const durationInFrames = Math.max(Math.ceil((audioDuration || 0) * fps), 1);

  console.log('RemotionRoot: Received props:', {
    transcription,
    audioFileName,
    audioDuration,
    headlines,
    images,
    diagramDescription,
  });

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
        images: images || [],
        diagramDescription: diagramDescription || null,
      }}
    />
  );
};