import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const Subtitle: React.FC<{
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