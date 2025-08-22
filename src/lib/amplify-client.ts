// src/lib/amplify-client.ts
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

// Transform the outputs to match the expected format
const config = {
  API: {
    GraphQL: {
      endpoint: outputs.data.url,
      region: outputs.data.aws_region,
      defaultAuthorizationMode: 'apiKey',
      apiKey: outputs.data.api_key
    }
  }
};

Amplify.configure(config);
