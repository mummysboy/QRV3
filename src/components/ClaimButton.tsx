export default function ClaimButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={onClick}
        className="bg-green-800 hover:bg-green-700 transition text-white text-lg font-semibold px-8 py-3 rounded-full shadow-md"
      >
        Claim Reward
      </button>
    </div>
  );
}
