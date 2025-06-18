// File: src/components/RedeemButton.tsx
"use client";

type RedeemButtonProps = {
  cardId: string;
};

export default function RedeemButton({ cardId }: RedeemButtonProps) {
  const handleClick = async () => {
    alert(`🎁 Reward for card ${cardId} has been redeemed!`);

    // Optional: make an API call to mark it redeemed
    // await fetch("/api/redeem", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ cardId }),
    // });
  };

  return (
    <button
      onClick={handleClick}
      className="bg-green-800 hover:bg-green-700 transition text-white text-lg font-semibold px-8 py-3 rounded-full shadow-md"
    >
      Redeem Reward
    </button>
  );
}
