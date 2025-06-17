"use client";

import { useEffect, useState } from "react";

export default function Toast({ message }: { message: string }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded bg-gray-800 px-6 py-3 text-white shadow-xl transition-opacity">
      {message}
    </div>
  );
}
