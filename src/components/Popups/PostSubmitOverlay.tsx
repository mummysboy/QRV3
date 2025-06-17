// components/Popups/PostSubmitOverlay.tsx
export default function PostSubmitOverlay({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white p-6 rounded-xl text-center w-full max-w-sm">
        <p className="text-lg mb-2">We sent your reward via text</p>
        <p className="text-sm mb-2">You may play again in...</p>
        <div className="text-2xl font-bold mb-1">24:00:00</div>
        <div className="text-xs flex justify-center gap-3 mb-3">
          <span>Hours</span>
          <span>Minutes</span>
          <span>Seconds</span>
        </div>
        <p className="text-sm">Thank you!</p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="48"
          height="48"
          className="mx-auto mt-4 text-green-600"
        >
          <path d="M0 0h24v24H0V0z" fill="none" />
          <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" />
        </svg>
        <button
          onClick={onClose}
          className="mt-4 text-sm underline text-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}