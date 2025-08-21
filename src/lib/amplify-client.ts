// src/lib/amplify-client.ts
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import outputs from "../../amplify_outputs.json";

// Configure Amplify with the restored GraphQL configuration
Amplify.configure(outputs);

console.log('🔧 Amplify configured with:', {
  apiEndpoint: outputs.data?.url,
  region: outputs.data?.aws_region || 'unknown',
  authType: outputs.data?.default_authorization_type,
  hasApiKey: !!outputs.data?.api_key
});

// Export a configured client generator
export function generateConfiguredClient() {
  console.log('🔧 Generating GraphQL client with authMode: apiKey');
  console.log('🔧 API Key:', outputs.data?.api_key);
  console.log('🔧 API URL:', outputs.data?.url);
  
  try {
    const client = generateClient();
    console.log('🔧 GraphQL client generated successfully:', typeof client);
    return client;
  } catch (error) {
    console.error('🔧 Error generating GraphQL client:', error);
    throw error;
  }
}
