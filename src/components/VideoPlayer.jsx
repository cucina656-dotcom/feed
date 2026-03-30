// src/components/VideoPlayer.jsx
import React, { useRef, useState, useEffect, useMemo } from "react";

const API_BASE = 'https://modekit.cucina656.workers.dev';

function VideoPlayer({ src, subtitle, onPlay }) {
  const videoRef = useRef(null);
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  
  // 1. Resolve the Full URL
  // If the src is just a filename (e.g. /a/post_123.mp4), make it absolute.
  const fullVideoURL = useMemo(() => {
    if (!src) return "";
    return src.startsWith("http") ? src : `${API_BASE}${src}`;
  }, [src]);

  // 2. Parse Subtitles into a usable format
  const subtitleCues = useMemo(() => {
    if (subtitle && subtitle.text) {
      return [{
        text: subtitle.text,
        start: Number(subtitle.start) || 0,
        end: (Number(subtitle.start) || 0) + (Number(subtitle.duration) || 5),
      }];
    }
    return [];
  }, [subtitle]);

  // 3. Handle Time Updates (Subtitle Sync)
  const handleTimeUpdate = () => {
    if (!videoRef.current || subtitleCues.length === 0) return;
    
    const currentTime = videoRef.current.currentTime;
    const activeCue = subtitleCues.find(
      (cue) => currentTime >= cue.start && currentTime <= cue.end
    );
    
    // Only update state if the text actually changed to prevent re-renders
    const newText = activeCue ? activeCue.text : "";
    if (currentSubtitle !== newText) {
      setCurrentSubtitle(newText);
    }
  };

  const handleClick = () => {
    if (!videoRef.current) return;
    videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
  };

  const handleFullscreen = (e) => {
    e.stopPropagation(); // Prevent triggerring handleClick
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen();
    }
  };

  // Styles
  const subtitleStyle = {
    position: "absolute",
    bottom: subtitle?.position === "top" ? "auto" : "20%",
    top: subtitle?.position === "top" ? "10%" : "auto",
    left: "50%",
    transform: "translateX(-50%)",
    textAlign: "center",
    pointerEvents: "none",
    zIndex: 10,
    fontSize: `${subtitle?.size || 22}px`,
    fontWeight: "bold",
    color: "white",
    textShadow: `0 0 8px ${subtitle?.color || "#ff006e"}, 0 0 15px ${subtitle?.color || "#ff006e"}`,
    padding: "8px 16px",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: "6px",
    maxWidth: "85%",
    transition: "opacity 0.2s ease",
  };

  if (!src) {
    return <div style={{ padding: "40px", color: "#666" }}>Video unavailable</div>;
  }

  return (
    <div
      className="video-container"
      style={{ 
        position: "relative", 
        width: "100%", 
        backgroundColor: "#000",
        borderRadius: "12px",
        overflow: "hidden"
      }}
      onClick={handleClick}
      onDoubleClick={handleFullscreen}
    >
      <video
        ref={videoRef}
        src={fullVideoURL}
        onPlay={onPlay}
        onTimeUpdate={handleTimeUpdate}
        controls
        playsInline
        crossOrigin="anonymous" // Essential if video is on a different domain
        preload="metadata"
        style={{
          width: "100%",
          display: "block",
          maxHeight: "600px",
          objectFit: "contain",
        }}
      >
        Your browser does not support the video tag.
      </video>

      {/* Subtitle Overlay */}
      {currentSubtitle && (
        <div className="neon-subtitle" style={subtitleStyle}>
          {currentSubtitle}
        </div>
      )}

      <style>{`
        .neon-subtitle {
          animation: neonPulse 1.5s ease-in-out infinite alternate;
        }
        @keyframes neonPulse {
          from { opacity: 0.9; transform: translateX(-50%) scale(1); }
          to { opacity: 1; transform: translateX(-50%) scale(1.02); }
        }
      `}</style>
    </div>
  );
}

export default VideoPlayer;
