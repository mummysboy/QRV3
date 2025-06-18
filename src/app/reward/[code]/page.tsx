// src/app/reward/[code]/page.tsx

import { Metadata } from "next";

type PageProps = {
  params: Promise<{
    code: string;
  }>;
};

type RewardData = {
  // Define your reward data structure here
  // For example:
  id: string;
  name: string;
  description: string;
};

// Optional: dynamic metadata
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Reward Code: ${code}`,
    description: `Details for reward code ${code}`,
  };
}

async function fetchRewardData(code: string): Promise<RewardData | null> {
  try {
    const res = await fetch(`https://your-api.com/reward/${code}`);
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function RewardPage({ params }: PageProps) {
  const { code } = await params;
  const rewardData = await fetchRewardData(code);

  if (!rewardData) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-white text-black">
        <h1 className="text-3xl font-bold mb-4">😕 Reward Not Found!</h1>
        <p className="text-lg">
          Sorry, we couldn't find any reward data for code{" "}
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
            {code}
          </span>
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-white text-black">
      <h1 className="text-3xl font-bold mb-4">🎉 Reward Unlocked!</h1>
      <p className="text-lg">
        Your reward code is:{" "}
        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{code}</span>
      </p>
      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-2">{rewardData.name}</h2>
        <p className="text-lg">{rewardData.description}</p>
      </div>
    </main>
  );
}
