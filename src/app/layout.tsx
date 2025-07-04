// src/app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "QRewards – Scan. Play. Win!",
  description: "A fun, interactive reward experience powered by QR codes.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <main>{children}</main>
      </body>
    </html>
  );
}
