import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

interface ImageSequenceProps {
  images: string[];
  startFrame: number;
  duration: number;
}

export const ImageSequence: React.FC<ImageSequenceProps> = ({ images, startFrame, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = frame - startFrame;
  
  if (adjustedFrame < 0 || adjustedFrame >= duration) {
    return null;
  }

  const imageDuration = Math.floor(duration / images.length);
  const currentImageIndex = Math.floor(adjustedFrame / imageDuration) % images.length;
  const currentImage = images[currentImageIndex];

  // ... (rest of the component logic)

  return (
    // ... (component JSX)
  );
};