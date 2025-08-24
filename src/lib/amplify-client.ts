// src/lib/amplify-client.ts
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

// Configure Amplify with the new schema
const config = {
  API: {
    GraphQL: {
      endpoint: outputs.API.GraphQL.endpoint,
      region: outputs.API.GraphQL.region,
      defaultAuthMode: 'API_KEY',
      apiKey: outputs.API.GraphQL.defaultAuthorization.apiKey,
      // Add IAM as fallback authorization
      additionalAuthorizationModes: [
        {
          mode: 'AWS_IAM',
          region: outputs.API.GraphQL.region
        }
      ]
    }
  }
};

Amplify.configure(config as any);
