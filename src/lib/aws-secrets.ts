import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const secretsClient = new SecretsManagerClient({
  region: "us-west-1",
});

interface OpenAIKeys {
  apiKey?: string;
  projectKey?: string;
}

let cachedKeys: OpenAIKeys | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getOpenAIKeys(): Promise<OpenAIKeys> {
  // Check cache first
  if (cachedKeys && Date.now() < cacheExpiry) {
    console.log('🔍 Using cached OpenAI keys');
    return cachedKeys;
  }

  console.log('🔍 Fetching OpenAI keys from AWS Secrets Manager');
  
  const keys: OpenAIKeys = {};

  try {
    // Get OpenAI API Key
    try {
      const apiKeyCommand = new GetSecretValueCommand({
        SecretId: "qrewards/openai-api-key",
      });
      const apiKeyResponse = await secretsClient.send(apiKeyCommand);
      if (apiKeyResponse.SecretString) {
        keys.apiKey = apiKeyResponse.SecretString;
        console.log('🔍 OpenAI API key retrieved successfully');
      }
    } catch (error) {
      console.warn('⚠️ Could not retrieve OpenAI API key:', error);
    }

    // Get OpenAI Project Key
    try {
      const projectKeyCommand = new GetSecretValueCommand({
        SecretId: "qrewards/openai-project-key",
      });
      const projectKeyResponse = await secretsClient.send(projectKeyCommand);
      if (projectKeyResponse.SecretString) {
        keys.projectKey = projectKeyResponse.SecretString;
        console.log('🔍 OpenAI project key retrieved successfully');
      }
    } catch (error) {
      console.warn('⚠️ Could not retrieve OpenAI project key:', error);
    }

    // Cache the results
    cachedKeys = keys;
    cacheExpiry = Date.now() + CACHE_DURATION;

    return keys;
  } catch (error) {
    console.error('❌ Error fetching OpenAI keys from Secrets Manager:', error);
    return {};
  }
}

export function getOpenAIKey(): string | null {
  // For immediate access, try environment variables first, then cached secrets
  const envApiKey = process.env.OPENAI_API_KEY;
  const envProjectKey = process.env.OPENAI_PROJECT_KEY;

  if (envProjectKey && envProjectKey.startsWith('proj-')) {
    return envProjectKey;
  }
  if (envApiKey && envApiKey.startsWith('sk-')) {
    return envApiKey;
  }

  // Return cached keys if available
  if (cachedKeys) {
    if (cachedKeys.projectKey && cachedKeys.projectKey.startsWith('proj-')) {
      return cachedKeys.projectKey;
    }
    if (cachedKeys.apiKey && cachedKeys.apiKey.startsWith('sk-')) {
      return cachedKeys.apiKey;
    }
  }

  return null;
} 