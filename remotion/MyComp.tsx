import React, { useEffect } from 'react';
import {
  useVideoConfig,
  Img,
  staticFile,
  Audio,
  interpolate,
  useCurrentFrame,
  Sequence,
  delayRender,
  continueRender
} from 'remotion';
import { Transcription } from './types';

// Inline Subtitle component
const Subtitle: React.FC<{
  word: string;
  speaker: number;
  startTime: number;
  endTime: number;
}> = ({ word, speaker, startTime, endTime }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const color = speaker === 0 ? '#FF69B4' : '#00BFFF';
  
  const startFrame = Math.floor(startTime * fps);
  const endFrame = Math.floor(endTime * fps);
  const isVisible = frame >= startFrame && frame < endFrame;

  if (!isVisible) return null;

  const avatarSize = height * 0.25;
  const avatarMargin = 40;

  const subtitleStyle: React.CSSProperties = {
    position: 'absolute',
    maxWidth: width * 0.35,
    fontSize: 36,
    fontWeight: 'bold',
    color: color,
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: '12px 24px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
    zIndex: 3,
  };

  const position = speaker === 0
    ? { bottom: avatarSize + avatarMargin + 20, left: avatarMargin, textAlign: 'left' as const }
    : { bottom: avatarSize + avatarMargin + 20, right: avatarMargin, textAlign: 'right' as const };

  return (
    <div style={{ ...subtitleStyle, ...position }}>
      {word}
    </div>
  );
};

export const MyComp: React.FC<{ 
  transcription: Transcription; 
  audioFileName: string;
  audioDuration: number;
}> = ({ transcription, audioFileName, audioDuration }) => {
  const videoConfig = useVideoConfig();
  const frame = useCurrentFrame();

  const words = transcription?.words || [];

  useEffect(() => {
    const handle = delayRender();
    const durationInFrames = Math.ceil(audioDuration * videoConfig.fps);
    videoConfig.durationInFrames = durationInFrames;
    console.log(`MyComp: Setting video duration to ${durationInFrames} frames (${audioDuration} seconds)`);
    continueRender(handle);
  }, [audioDuration, videoConfig]);

  console.log(`MyComp: Audio duration: ${audioDuration} seconds, Video duration: ${videoConfig.durationInFrames} frames (${videoConfig.durationInFrames / videoConfig.fps} seconds)`);

  const avatarSize = videoConfig.height * 0.25;
  const avatarMargin = 40;

  const audioSrc = staticFile(`audio/${audioFileName}`);

  const currentSpeaker = React.useMemo(() => {
    const currentTime = frame / videoConfig.fps;
    return words.find(word => currentTime >= word.start && currentTime < word.end)?.speaker ?? -1;
  }, [frame, videoConfig.fps, words]);

  const backgroundOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  if (!transcription || !words.length) {
    console.log('Transcription or words are empty');
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#0F172A',
        color: 'white',
        fontSize: '24px'
      }}>
        Loading transcription data...
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%', 
      backgroundColor: '#0F172A',
      overflow: 'hidden'
    }}>
      {/* Background */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        opacity: backgroundOpacity,
        zIndex: 1,
        overflow: 'hidden'
      }}>
        <Img 
          src={staticFile("background.png")} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
          }} 
        />
      </div>

      {/* Podcast Title */}
      <Sequence from={0} durationInFrames={60}>
        <div style={{
          position: 'absolute',
          top: 20,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 40,
          fontWeight: 'bold',
          color: '#FFFFFF',
          zIndex: 2
        }}>
          Smart and Crazy
        </div>
      </Sequence>

      {/* Avatars */}
      <div style={{ position: 'absolute', bottom: avatarMargin, left: avatarMargin, zIndex: 2 }}>
        <Img
          src={staticFile("sarah.png")}
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: '50%',
            border: currentSpeaker === 0 ? '4px solid #FF69B4' : '4px solid transparent',
            filter: currentSpeaker === 0 ? 'none' : 'brightness(50%)',
            transition: 'filter 0.3s ease-in-out, transform 0.3s ease-in-out',
            transform: currentSpeaker === 0 ? 'scale(1.1)' : 'scale(1)',
          }}
        />
        <div style={{
          textAlign: 'center',
          color: currentSpeaker === 0 ? '#FFD700' : '#FFFFFF',
          marginTop: 10,
          fontSize: 24,
        }}>
          Sarah
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: avatarMargin, right: avatarMargin, zIndex: 2 }}>
        <Img
          src={staticFile("john.png")}
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: '50%',
            border: currentSpeaker === 1 ? '4px solid #00BFFF' : '4px solid transparent',
            filter: currentSpeaker === 1 ? 'none' : 'brightness(50%)',
            transition: 'filter 0.3s ease-in-out, transform 0.3s ease-in-out',
            transform: currentSpeaker === 1 ? 'scale(1.1)' : 'scale(1)',
          }}
        />
        <div style={{
          textAlign: 'center',
          color: currentSpeaker === 1 ? '#FFD700' : '#FFFFFF',
          marginTop: 10,
          fontSize: 24,
        }}>
          John
        </div>
      </div>

      {/* Subtitles */}
      {words.map((word, index) => (
        <Subtitle
          key={index}
          word={word.word}
          speaker={word.speaker}
          startTime={word.start}
          endTime={word.end}
        />
      ))}

      {/* Audio */}
      <Audio src={audioSrc} />
    </div>
  );
};