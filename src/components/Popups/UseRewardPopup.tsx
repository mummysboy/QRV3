// components/Popups/UseRewardPopup.tsx
export default function UseRewardPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-xl text-center min-w-[280px]">
        <p className="mb-4">Are you sure you want to use this reward?</p>
        <div className="flex justify-center gap-4">
          <button className="bg-green-700 text-white px-4 py-2 rounded">
            Yes
          </button>
          <button onClick={onClose} className="border px-4 py-2 rounded">
            No
          </button>
        </div>
      </div>
    </div>
  );
}
