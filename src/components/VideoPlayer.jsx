// src/components/VideoPlayer.jsx
import React, { useRef, useState, useEffect } from 'react';

function VideoPlayer({ src, subtitle, onPlay }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [subtitles, setSubtitles] = useState([]);

  useEffect(() => {
    // Parse subtitles if provided
    if (subtitle && subtitle.text) {
      if (subtitle.type === 'cues' && Array.isArray(subtitle.cues)) {
        setSubtitles(subtitle.cues);
      } else if (subtitle.text) {
        // Simple static subtitle
        setCurrentSubtitle(subtitle.text);
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
    if (subtitles.length > 0 && videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const activeSubtitle = subtitles.find(
        sub => currentTime >= sub.start && currentTime <= sub.end
      );
      setCurrentSubtitle(activeSubtitle ? activeSubtitle.text : '');
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

  // Handle fullscreen on tap/click
  const handleFullScreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      }
      videoRef.current.play();
    }
  };

  return (
    <div className="video-container" onClick={handleFullScreen}>
      <video
        ref={videoRef}
        src={src}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        controls
        playsInline
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
      {currentSubtitle && (
        <div className="video-subtitle">
          {currentSubtitle}
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;