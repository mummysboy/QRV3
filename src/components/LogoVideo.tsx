export default function LogoVideo() {
  return (
    <div
      className="w-full bg-white flex justify-center items-center overflow-hidden"
      style={{ height: "110px" }}
    >
      <video
        src="/assets/videos/Animetion%20Logo.mp4"
        autoPlay
        muted
        playsInline
        className="h-[400px] object-cover" // increased from 130px → 160px (25% larger)
      />
    </div>
  );
}
