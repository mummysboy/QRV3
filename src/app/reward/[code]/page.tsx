// src/app/reward/[code]/page.tsx

import { Metadata } from "next";

type PageProps = {
  params: {
    code: string;
  };
};

// Optional: dynamic metadata
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return {
    title: `Reward Code: ${params.code}`,
    description: `Details for reward code ${params.code}`,
  };
}

export default async function RewardPage({ params }: PageProps) {
  const { code } = params;

  // Optional: Fetch reward data from your backend
  // const res = await fetch(`https://your-api.com/reward/${code}`);
  // const reward = await res.json();

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-white text-black">
      <h1 className="text-3xl font-bold mb-4">🎉 Reward Unlocked!</h1>
      <p className="text-lg">
        Your reward code is:{" "}
        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{code}</span>
      </p>

      {/* Optional render of reward data */}
      {/* <div className="mt-4">{JSON.stringify(reward)}</div> */}
    </main>
  );
}
