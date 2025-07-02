import { useRef, useEffect } from "react";

export default function LogoVideo({ playbackRate = 1 }: { playbackRate?: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  return (
    <div
      className="w-full bg-white flex justify-center items-center overflow-hidden"
      style={{ height: "110px" }}
    >
      <video
        ref={videoRef}
        src="/assets/videos/Animetion%20Logo.mp4"
        autoPlay
        muted
        playsInline
        className="h-[400px] object-cover" // increased from 130px → 160px (25% larger)
      />
    </div>
  );
}
