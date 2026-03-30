// src/components/VideoPlayer.jsx
import React, { useRef, useState, useEffect } from "react";

function VideoPlayer({ src, subtitle, onPlay }) {
  const videoRef = useRef(null);
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [subtitleCues, setSubtitleCues] = useState([]);
  const [videoURL, setVideoURL] = useState("");

  // Handle src - ensure it's a valid URL
  useEffect(() => {
    if (!src) {
      console.log("VideoPlayer: No src provided");
      return;
    }
    
    console.log("VideoPlayer: Setting src to:", src);
    setVideoURL(src);
    
    // If video element already exists, set src directly
    if (videoRef.current) {
      videoRef.current.src = src;
      videoRef.current.load();
    }
  }, [src]);

  // Parse subtitles
  useEffect(() => {
    if (subtitle && subtitle.text) {
      const cues = [
        {
          text: subtitle.text,
          start: subtitle.start || 0,
          end: (subtitle.start || 0) + (subtitle.duration || 5),
        },
      ];
      setSubtitleCues(cues);
    }
  }, [subtitle]);

  const handlePlay = () => {
    if (onPlay) onPlay();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && subtitleCues.length > 0) {
      const currentTime = videoRef.current.currentTime;
      const activeCue = subtitleCues.find(
        (cue) => currentTime >= cue.start && currentTime <= cue.end
      );
      setCurrentSubtitle(activeCue ? activeCue.text : "");
    }
  };

  // Click = play/pause
  const handleClick = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  // Double click = fullscreen
  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen();
    }
  };

  // Subtitle style (neon)
  const subtitleStyle = {
    position: "absolute",
    bottom: subtitle?.position === "top" ? "auto" : "15%",
    top: subtitle?.position === "top" ? "10%" : "auto",
    left: "50%",
    transform: "translateX(-50%)",
    textAlign: "center",
    pointerEvents: "none",
    zIndex: 10,
    fontSize: `${subtitle?.size || 24}px`,
    fontWeight: "bold",
    color: "white",
    textShadow: `0 0 10px ${subtitle?.color || "#ff006e"},
                 0 0 20px ${subtitle?.color || "#ff006e"},
                 0 0 30px ${subtitle?.color || "#ff006e"}`,
    animation: "neonPulse 1.5s ease-in-out infinite alternate",
    padding: "10px",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: "8px",
    maxWidth: "80%",
    whiteSpace: "nowrap",
  };

  if (!src) {
    return <div className="post-media" style={{ padding: "20px", textAlign: "center" }}>No video source</div>;
  }

  return (
    <div
      className="video-container"
      style={{ position: "relative", width: "100%", cursor: "pointer" }}
      onClick={handleClick}
      onDoubleClick={handleFullscreen}
    >
      <video
        ref={videoRef}
        src={videoURL}
        onPlay={handlePlay}
        onTimeUpdate={handleTimeUpdate}
        controls
        playsInline
        preload="metadata"
        style={{
          width: "100%",
          height: "auto",
          maxHeight: "500px",
          objectFit: "cover",
          borderRadius: "12px",
        }}
      >
        Your browser does not support the video tag.
      </video>

      {/* Subtitle */}
      {currentSubtitle && <div style={subtitleStyle}>{currentSubtitle}</div>}

      {/* Neon animation */}
      <style>{`
        @keyframes neonPulse {
          from {
            text-shadow: 0 0 5px ${subtitle?.color || "#ff006e"},
                         0 0 10px ${subtitle?.color || "#ff006e"};
          }
          to {
            text-shadow: 0 0 15px ${subtitle?.color || "#ff006e"},
                         0 0 25px ${subtitle?.color || "#ff006e"},
                         0 0 35px ${subtitle?.color || "#ff006e"};
          }
        }
      `}</style>
    </div>
  );
}

export default VideoPlayer;
