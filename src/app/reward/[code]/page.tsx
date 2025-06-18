import { notFound } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

interface PageProps {
  params: {
    code: string;
  };
}

export default async function RewardPage({ params }: PageProps) {
  const { code } = params;

  const { data, error } = await supabase
    .from("claimed_rewards")
    .select("*")
    .eq("id", code) // or use .eq("code", code) if you use a custom field
    .single();

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-screen text-center text-red-600 text-xl font-semibold">
        Reward not found.
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Image
        src="/logo.png"
        alt="Reward Background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white text-center px-6 animate-fadeIn">
        <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
          🎉 Your Reward Is Here!
        </h1>
        <p className="text-lg mb-6 max-w-md">
          {data.subheader || "Enjoy your exclusive reward!"}
        </p>
        <a
          href={data.addressurl || "#"}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-lg transition shadow-md"
        >
          Redeem Reward
        </a>
      </div>
    </div>
  );
}
