// src/components/VideoPlayer.jsx
import React, { useRef, useState, useEffect } from 'react';

function VideoPlayer({ src, subtitle, mediaType, onPlay }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [subtitleCues, setSubtitleCues] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Parse subtitle data if provided
    if (subtitle && subtitle.text) {
      if (subtitle.cues && Array.isArray(subtitle.cues)) {
        setSubtitleCues(subtitle.cues);
      } else if (subtitle.text) {
        // Simple static subtitle with timing
        const cues = [{
          text: subtitle.text,
          start: subtitle.start || 0,
          end: (subtitle.start || 0) + (subtitle.duration || 5)
        }];
        setSubtitleCues(cues);
      }
    }
  }, [subtitle]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (onPlay) onPlay();
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && subtitleCues.length > 0) {
      const currentTime = videoRef.current.currentTime;
      const activeCue = subtitleCues.find(
        cue => currentTime >= cue.start && currentTime <= cue.end
      );
      setCurrentSubtitle(activeCue ? activeCue.text : '');
    }
  };

  const handleClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        } else if (videoRef.current.webkitRequestFullscreen) {
          videoRef.current.webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    }
  };

  // Subtitle style with neon effect
  const subtitleStyle = {
    position: 'absolute',
    bottom: subtitle?.position === 'top' ? 'auto' : '15%',
    top: subtitle?.position === 'top' ? '10%' : 'auto',
    left: '0',
    right: '0',
    textAlign: 'center',
    pointerEvents: 'none',
    zIndex: 10,
    fontSize: `${subtitle?.size || 24}px`,
    fontWeight: 'bold',
    color: 'white',
    textShadow: `0 0 10px ${subtitle?.color || '#ff006e'}, 0 0 20px ${subtitle?.color || '#ff006e'}, 0 0 30px ${subtitle?.color || '#ff006e'}`,
    animation: 'neonPulse 1.5s ease-in-out infinite alternate',
    padding: '10px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: '8px',
    display: 'inline-block',
    width: 'auto',
    maxWidth: '80%',
    margin: '0 auto',
    transform: 'translateX(-50%)',
    left: '50%'
  };

  return (
    <div 
      className="video-container" 
      style={{ position: 'relative', width: '100%', cursor: 'pointer' }}
      onClick={handleFullscreen}
    >
      <video
        ref={videoRef}
        src={src}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        controls
        playsInline
        preload="metadata"
        style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover' }}
      >
        Your browser does not support the video tag.
      </video>
      {currentSubtitle && (
        <div style={subtitleStyle}>
          {currentSubtitle}
        </div>
      )}
      <style>{`
        @keyframes neonPulse {
          from {
            text-shadow: 0 0 5px ${subtitle?.color || '#ff006e'}, 0 0 10px ${subtitle?.color || '#ff006e'};
          }
          to {
            text-shadow: 0 0 15px ${subtitle?.color || '#ff006e'}, 0 0 25px ${subtitle?.color || '#ff006e'}, 0 0 35px ${subtitle?.color || '#ff006e'};
          }
        }
      `}</style>
    </div>
  );
}

export default VideoPlayer;