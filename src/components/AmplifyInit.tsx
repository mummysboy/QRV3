// src/components/AmplifyInit.tsx
"use client";

import { useEffect } from "react";
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

export default function AmplifyInit() {
  useEffect(() => {
    const fixedOutputs = {
      ...outputs,
      API: {
        ...outputs.API,
        GraphQL: {
          ...outputs.API?.GraphQL,
          defaultAuthMode: (outputs.API?.GraphQL?.defaultAuthMode ===
          "userPools"
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
  }, []);

  return null;
}
