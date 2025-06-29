// src/app/layout.tsx
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
// Ensure defaultAuthMode is of type GraphQLAuthMode
const fixedOutputs = {
  ...outputs,
  API: {
    ...outputs.API,
    GraphQL: {
      ...outputs.API?.GraphQL,
      defaultAuthMode: (outputs.API?.GraphQL?.defaultAuthMode === "userPools"
        ? "userPool"
        : outputs.API?.GraphQL?.defaultAuthMode) as
        | "apiKey"
        | "iam"
        | "oidc"
        | "userPool"
        | "lambda",
    },
  },
};
Amplify.configure(fixedOutputs);
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
