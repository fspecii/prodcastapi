import React, { useEffect, useState, ErrorInfo } from 'react';
import {
  useVideoConfig,
  Img,
  staticFile,
  Audio,
  interpolate,
  useCurrentFrame,
  spring,
  random,
  Easing,
  Sequence,
  delayRender,
  continueRender
} from 'remotion';
import { Transcription } from './types';
import DiagramRenderer from './DiagramRenderer';
import { DiagramSequence } from './DiagramSequence';
import { ImageSequence } from './ImageSequence';

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


const BounceIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const scale = spring({
    fps,
    frame,
    config: {
      damping: 10,
      stiffness: 160,
      mass: 1,
    },
  });

  return (
    <div style={{ transform: `scale(${scale})` }}>
      {children}
    </div>
  );
};

const FadeIn: React.FC<{ children: React.ReactNode; duration: number }> = ({ children, duration }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, duration], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return <div style={{ opacity }}>{children}</div>;
};

const BrowserFrame: React.FC<{ children: React.ReactNode; isScrollable: boolean }> = ({ children, isScrollable }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  const scrollProgress = isScrollable
    ? interpolate(frame % durationInFrames, [0, durationInFrames], [0, 1], {
        extrapolateRight: 'clamp',
      })
    : 0;

  const cursorX = spring({
    frame: frame % (durationInFrames / 2),
    fps: 30,
    config: { damping: 100, stiffness: 200, mass: 0.5 },
  });

  const cursorY = spring({
    frame: frame % durationInFrames,
    fps: 30,
    config: { damping: 100, stiffness: 200, mass: 0.5 },
  });

  return (
    <div style={{
      backgroundColor: '#f0f0f0',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      <div style={{
        backgroundColor: '#e0e0e0',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#ff5f56',
          marginRight: '6px',
        }}></div>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#ffbd2e',
          marginRight: '6px',
        }}></div>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#27c93f',
        }}></div>
      </div>
      <div style={{
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: isScrollable ? `${-50 * scrollProgress}%` : 0,
          left: 0,
          right: 0,
          bottom: isScrollable ? 'auto' : 0,
          height: isScrollable ? '150%' : '100%',
          transition: 'top 0.1s linear',
        }}>
          {children}
        </div>
        {isScrollable && (
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
          }}>
            <div style={{
              position: 'absolute',
              top: `${scrollProgress * 100}%`,
              left: 0,
              right: 0,
              height: '20%',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '4px',
              transition: 'top 0.1s linear',
            }}></div>
          </div>
        )}
      </div>
      <div style={{
        position: 'absolute',
        top: `${interpolate(cursorY, [0, 1], [0, 100])}%`,
        left: `${interpolate(cursorX, [0, 1], [0, 100])}%`,
        width: '20px',
        height: '20px',
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M0 0 L20 20 L10 20 L8 12 L0 10 Z" fill="black"/></svg>')`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
        zIndex: 1000,
      }}></div>
    </div>
  );
};

const ImageSequence: React.FC<{ images: string[] }> = ({ images }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  console.log('ImageSequence: Received images:', images);

  if (!images || images.length === 0) {
    console.warn('No images provided to ImageSequence. Using default images.');
    images = [
      'default_image_1.jpg',
      'default_image_2.jpg',
      'default_image_3.jpg',
      'default_image_4.jpg',
      'default_image_5.jpg',
    ];
  }

  const delayFrames = 5 * fps; // 5 seconds delay
  const imageDuration = Math.floor((durationInFrames - delayFrames) / images.length);

  const currentImageIndex = Math.floor((frame - delayFrames) / imageDuration);
  const currentImage = images[Math.max(0, Math.min(currentImageIndex, images.length - 1))];

  console.log(`Current image index: ${currentImageIndex}, Current image: ${currentImage}`);
  
  if (currentImage.startsWith('/temp/')) {
    console.log('Using image from Gemini query:', currentImage);
  } else {
    console.log('Using default image:', currentImage);
  }

  const seed = random(currentImageIndex * 1000);
  const isScrollable = currentImageIndex === 0 || seed > 0.7;

  const progress = (frame - delayFrames) % imageDuration / imageDuration;

  const zoomEffect = spring({
    fps,
    frame: frame - delayFrames,
    config: { 
      damping: 100,
      stiffness: 200,
      mass: 0.5
    },
    from: 1,
    to: isScrollable ? 1 : 1.05,
  });

  const rotationEffect = isScrollable ? 0 : interpolate(
    progress,
    [0, 1],
    [0, seed * 4 - 2],
    { extrapolateRight: 'clamp', easing: Easing.bezier(0.25, 0.1, 0.25, 1) }
  );

  const translateX = isScrollable ? 0 : interpolate(
    progress,
    [0, 1],
    [0, seed * 20 - 10],
    { extrapolateRight: 'clamp', easing: Easing.bezier(0.25, 0.1, 0.25, 1) }
  );

  const translateY = isScrollable ? 0 : interpolate(
    progress,
    [0, 1],
    [0, seed * 20 - 10],
    { extrapolateRight: 'clamp', easing: Easing.bezier(0.25, 0.1, 0.25, 1) }
  );

  const transform = `
    translate(-50%, -50%) 
    translate(${translateX}px, ${translateY}px)
    scale(${zoomEffect}) 
    rotate(${rotationEffect}deg)
  `;

  const imageContent = (
    <Img
      src={staticFile(currentImage)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
    />
  );

  const content = isScrollable ? (
    <BrowserFrame isScrollable={true}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {imageContent}
      </div>
    </BrowserFrame>
  ) : imageContent;

  if (frame < delayFrames) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform,
        width: isScrollable ? '80%' : '55%',
        height: isScrollable ? '80%' : 'auto',
        zIndex: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        ...(isScrollable ? {} : {
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          borderRadius: '15px',
        }),
      }}
    >
      {content}
    </div>
  );
};

const HeadlineComponent: React.FC<{ headline: string; index: number; totalHeadlines: number }> = ({ headline, index, totalHeadlines }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  const headlineSpacing = Math.floor(durationInFrames / totalHeadlines);
  const startFrame = index * headlineSpacing;
  const endFrame = startFrame + 5 * fps; // 5 seconds duration
  const headlineFrame = frame - startFrame;
  
  const fadeInDuration = 30; // 1 second fade in
  const fadeOutDuration = 30; // 1 second fade out
  const visibleDuration = 5 * fps - fadeInDuration - fadeOutDuration;
  
  const opacity = interpolate(
    headlineFrame,
    [0, fadeInDuration, fadeInDuration + visibleDuration, 5 * fps],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const bounceProgress = spring({
    fps,
    frame: headlineFrame,
    config: {
      damping: 12,
      stiffness: 200,
      mass: 0.5,
    },
  });

  const scale = interpolate(bounceProgress, [0, 1], [0.5, 1]);
  const translateY = interpolate(bounceProgress, [0, 1], [50, 0]);

  if (frame < startFrame || frame >= endFrame || opacity === 0) return null;

  // Remove asterisks from the headline
  const cleanHeadline = headline.replace(/\*\*/g, '');

  return (
    <div
      style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: `translate(-50%, ${translateY}px) scale(${scale})`,
        opacity,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '30px 50px',
        borderRadius: '15px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        width: '90%',
        maxWidth: '1200px',
        zIndex: 3,
      }}
    >
      <h2
        style={{
          color: '#FFFFFF',
          fontSize: '56px',
          fontWeight: 'bold',
          margin: 0,
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
          lineHeight: 1.2,
          letterSpacing: '0.5px',
        }}
      >
        {cleanHeadline}
      </h2>
    </div>
  );
};

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

export const MyComp: React.FC<{ 
  transcription: Transcription; 
  audioFileName: string;
  audioDuration: number;
  headlines: string[];
  images: string[];
  diagramDescription: any;
  diagramUrl: string;
}> = ({ transcription, audioFileName, audioDuration, headlines, images, diagramDescription, diagramUrl }) => {
  const videoConfig = useVideoConfig();
  const frame = useCurrentFrame();

  console.log('MyComp: Received props:', { transcription, audioFileName, audioDuration, headlines, images, diagramDescription, diagramUrl });

  const words = transcription?.words || [];

  useEffect(() => {
    const handle = delayRender();
    const durationInFrames = Math.ceil(audioDuration * videoConfig.fps);
    videoConfig.durationInFrames = durationInFrames;
    console.log(`MyComp: Setting video duration to ${durationInFrames} frames (${audioDuration} seconds)`);
    continueRender(handle);
  }, [audioDuration, videoConfig]);

  console.log(`MyComp: Audio duration: ${audioDuration} seconds, Video duration: ${videoConfig.durationInFrames} frames (${videoConfig.durationInFrames / videoConfig.fps} seconds)`);
  console.log('Headlines:', headlines);
  console.log('Images:', images);

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

  // Background animation parameters
  const zoomDuration = videoConfig.durationInFrames;
  const panDuration = videoConfig.durationInFrames / 2;

  // Calculate zoom and pan effects
  const zoom = interpolate(
    frame,
    [0, zoomDuration],
    [1, 1.1],
    { extrapolateRight: 'clamp' }
  );

  const panX = interpolate(
    frame % panDuration,
    [0, panDuration],
    [-5, 5],
    { extrapolateRight: 'clamp' }
  );

  const panY = interpolate(
    frame % (panDuration * 1.5),
    [0, panDuration * 1.5],
    [-5, 5],
    { extrapolateRight: 'clamp' }
  );

  // Calculate durations
  const totalFrames = videoConfig.durationInFrames;
  const diagramDuration = Math.min(10 * videoConfig.fps, totalFrames / 3); // Show diagram for 10 seconds or 1/3 of the video, whichever is longer
  const remainingFrames = totalFrames - diagramDuration;
  const imagesCount = images.length;
  const framesPerImage = Math.floor(remainingFrames / imagesCount);

  const isDiagramShowing = frame < diagramDuration;

  const getCurrentImage = () => {
    if (isDiagramShowing) return null;
    const imageIndex = Math.floor((frame - diagramDuration) / framesPerImage) % imagesCount;
    return images[imageIndex];
  };

  const currentImage = getCurrentImage();

  return (
    <ErrorBoundary>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        backgroundColor: '#0F172A',
        overflow: 'hidden'
      }}>
        {/* Background */}
        <FadeIn duration={30}>
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
                transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                transition: 'transform 0.05s linear'
              }} 
            />
          </div>
        </FadeIn>

        {/* Podcast Title */}
        <Sequence from={0} durationInFrames={60}>
          <BounceIn>
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
          </BounceIn>
        </Sequence>

        {/* Headlines */}
        {headlines.map((headline, index) => (
          <HeadlineComponent 
            key={index} 
            headline={headline} 
            index={index} 
            totalHeadlines={headlines.length} 
          />
        ))}

        {isDiagramShowing ? (
          <Img
            src={staticFile(diagramUrl)}
            style={{
              position: 'absolute',
              bottom: '10%', // Move the diagram 10% up from the bottom
              left: '50%',
              transform: 'translateX(-50%)', // Center horizontally
              maxWidth: '80%',
              maxHeight: '80%', // Reduce max height to fit better
              opacity: interpolate(
                frame,
                [0, 30, diagramDuration - 30, diagramDuration],
                [0, 1, 1, 0]
              ),
            }}
          />
        ) : (
          currentImage && (
            <ImageSequence 
              images={[currentImage]} 
              startFrame={diagramDuration}
              duration={framesPerImage}
            />
          )
        )}

        {/* Avatars */}
        <FadeIn duration={30}>
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
        </FadeIn>

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
    </ErrorBoundary>
  );
};