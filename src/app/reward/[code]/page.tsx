import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { type Metadata } from "next";

type RewardPageProps = {
  params: {
    code: string;
  };
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Your QReward 🎉",
  };
}


export default async function RewardPage({ params }: RewardPageProps) {
  const { code } = params;

  const { data, error } = await supabase
    .from("claimed_rewards")
    .select("*")
    .eq("id", code)
    .single();

  if (error || !data) {
    return (
      <div className="text-center mt-20 text-red-600">Reward not found.</div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <Image
        src="/your-background.jpg" // Make sure this file exists in /public
        alt="Background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white text-center px-6 animate-fadeIn">
        <h1 className="text-3xl font-bold mb-4">🎉 Your Reward Is Here!</h1>
        <p className="text-lg mb-6 max-w-md">{data.subheader}</p>
        <a
          href={data.addressurl}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-lg transition"
        >
          Redeem Reward
        </a>
      </div>
    </div>
  );
}
