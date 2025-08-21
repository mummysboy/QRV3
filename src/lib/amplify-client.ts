// src/lib/amplify-client.ts
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

// Transform the outputs to match the expected format
const config = {
  API: {
    GraphQL: {
      endpoint: outputs.API.GraphQL.endpoint,
      region: outputs.API.GraphQL.region,
      defaultAuthorizationMode: 'apiKey',
      apiKey: outputs.API.GraphQL.defaultAuthorization.apiKey
    }
  }
};

Amplify.configure(config);
