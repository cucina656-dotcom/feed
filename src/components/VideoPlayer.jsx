// src/components/VideoPlayer.jsx
import React, { useRef, useState, useEffect } from "react";

function VideoPlayer({ src, subtitle, mediaType, onPlay }) {
  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [subtitleCues, setSubtitleCues] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoURL, setVideoURL] = useState("");

  // ✅ Handle src (File OR URL)
  useEffect(() => {
    if (!src) return;

    // If it's a File object (upload)
    if (typeof src === "object") {
      const url = URL.createObjectURL(src);
      setVideoURL(url);

      // Cleanup memory
      return () => URL.revokeObjectURL(url);
    } else {
      // If it's already a string URL
      setVideoURL(src);
    }
  }, [src]);

  // ✅ Parse subtitles
  useEffect(() => {
    if (subtitle && subtitle.text) {
      if (subtitle.cues && Array.isArray(subtitle.cues)) {
        setSubtitleCues(subtitle.cues);
      } else {
        const cues = [
          {
            text: subtitle.text,
            start: subtitle.start || 0,
            end: (subtitle.start || 0) + (subtitle.duration || 5),
          },
        ];
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
        (cue) => currentTime >= cue.start && currentTime <= cue.end
      );
      setCurrentSubtitle(activeCue ? activeCue.text : "");
    }
  };

  // ✅ Click = play/pause
  const handleClick = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  // ✅ Double click = fullscreen
  const handleFullscreen = () => {
    if (!videoRef.current) return;

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
      }
      setIsFullscreen(false);
    }
  };

  // ✅ Subtitle style (neon)
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
  };

  return (
    <div
      className="video-container"
      style={{ position: "relative", width: "100%", cursor: "pointer" }}
      onClick={handleClick}
      onDoubleClick={handleFullscreen}
    >
      <video
        ref={videoRef}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        controls
        playsInline
        muted
        autoPlay
        preload="metadata"
        style={{
          width: "100%",
          height: "auto",
          maxHeight: "500px",
          objectFit: "cover",
          borderRadius: "12px",
        }}
      >
        {/* ✅ Proper source handling */}
        <source src={videoURL} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* ✅ Subtitle */}
      {currentSubtitle && <div style={subtitleStyle}>{currentSubtitle}</div>}

      {/* ✅ Neon animation */}
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
