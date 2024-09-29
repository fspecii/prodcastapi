import React from 'react';
import { Composition } from "remotion";
import { MyComp } from "./MyComp";
import { Transcription } from "./types";

export const RemotionRoot: React.FC = () => {
  const fps = 30;

  return (
    <Composition
      id="MyComp"
      component={MyComp}
      durationInFrames={1}  // We'll set this dynamically in MyComp
      fps={fps}
      width={1920}
      height={1080}
      defaultProps={{
        transcription: {} as Transcription,
        audioFileName: "",
        audioDuration: 0
      }}
    />
  );
};