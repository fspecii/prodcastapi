import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import DiagramRenderer from './DiagramRenderer';

interface DiagramSequenceProps {
  diagramDescription: any;
  startFrame: number;
  duration: number;
}

export const DiagramSequence: React.FC<DiagramSequenceProps> = ({ diagramDescription, startFrame, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = frame - startFrame;
  
  if (adjustedFrame < 0 || adjustedFrame >= duration) {
    return null;
  }

  const progress = adjustedFrame / duration;

  const opacity = interpolate(
    progress,
    [0, 0.1, 0.9, 1],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      opacity,
    }}>
      <DiagramRenderer diagram={diagramDescription} />
    </div>
  );
};