// src/components/AmplifyInit.tsx
"use client";

import { useEffect } from "react";
import { Amplify, type ResourcesConfig } from "aws-amplify";
import outputsJson from "../amplify_outputs.json";

type AmplifyOutputs = {
  API?: {
    GraphQL?: {
      defaultAuthMode?: "apiKey" | "iam" | "oidc" | "userPools" | "userPool" | "lambda";
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

const outputs = outputsJson as AmplifyOutputs;

export default function AmplifyInit() {
  useEffect(() => {
    if (
      outputs.API &&
      outputs.API.GraphQL &&
      outputs.API.GraphQL.defaultAuthMode === "userPools"
    ) {
      Amplify.configure({
        ...outputs,
        API: {
          ...outputs.API,
          GraphQL: {
            ...outputs.API.GraphQL,
            defaultAuthMode: "userPool",
            endpoint: outputs.API.GraphQL.endpoint as string,
          },
        },
      });
    } else {
      Amplify.configure(outputs as ResourcesConfig);
    }
  }, []);

  return null;
}
