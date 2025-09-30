// src/lib/amplify-client.ts
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

// Configure Amplify with the new schema
const config = {
  API: {
    GraphQL: {
      endpoint: outputs.data.url,
      region: outputs.data.aws_region,
      defaultAuthMode: 'API_KEY',
      apiKey: outputs.data.api_key,
      // Add IAM as fallback authorization
      additionalAuthorizationModes: [
        {
          mode: 'AWS_IAM',
          region: outputs.data.aws_region
        }
      ]
    }
  }
};

Amplify.configure(config as any);
