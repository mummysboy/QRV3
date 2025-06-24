"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CardAnimation from "@/components/CardAnimation"; // adjust if needed

interface CardData {
  cardid: string;
  addresstext: string;
  addressurl: string;
  subheader: string;
  expires: string;
  quantity: number;
  logokey: string;
  header?: string;
}

export default function RewardPage() {
  const { id } = useParams();
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const res = await fetch(`/api/get-claimed-reward?id=${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unknown error");
        setCard(data);
      } catch (err: unknown) {
        setError(
          typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Failed to load reward."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCard();
  }, [id]);

  if (loading) return <p className="text-center mt-20">Loading reward...</p>;
  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;

  return <CardAnimation card={card} />;
}
