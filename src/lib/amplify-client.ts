// src/lib/amplify-client.ts
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import outputs from "../../amplify_outputs.json";

// Configure Amplify with the restored GraphQL configuration
Amplify.configure(outputs);

console.log('🔧 Amplify configured with:', {
  apiEndpoint: outputs.API?.GraphQL?.endpoint,
  region: outputs.API?.GraphQL?.endpoint?.split('.')[2] || 'unknown',
  authType: outputs.API?.GraphQL?.defaultAuthorization?.authorizationType,
  hasApiKey: !!outputs.API?.GraphQL?.defaultAuthorization?.apiKey
});

// Export a configured client generator
export function generateConfiguredClient() {
  console.log('🔧 Generating GraphQL client with authMode: apiKey');
  console.log('🔧 API Key:', outputs.API?.GraphQL?.defaultAuthorization?.apiKey);
  console.log('🔧 API URL:', outputs.API?.GraphQL?.endpoint);
  
  try {
    const client = generateClient();
    console.log('🔧 GraphQL client generated successfully:', typeof client);
    return client;
  } catch (error) {
    console.error('🔧 Error generating GraphQL client:', error);
    throw error;
  }
}
