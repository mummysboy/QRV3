import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { getOpenAIKeys, getOpenAIKey } from '@/lib/aws-secrets';

async function getOpenAIKeyAsync() {
  // First try to get from environment variables (for local development)
  const envKey = getOpenAIKey();
  if (envKey) {
    console.log('🔍 Using environment variable key');
    return envKey;
  }

  // If not in environment, try AWS Secrets Manager
  console.log('🔍 Fetching from AWS Secrets Manager');
  const keys = await getOpenAIKeys();
  
  if (keys.projectKey && keys.projectKey.startsWith('proj-')) {
    console.log('🔍 Using project key from Secrets Manager');
    return keys.projectKey;
  }
  if (keys.apiKey && keys.apiKey.startsWith('sk-')) {
    console.log('🔍 Using API key from Secrets Manager');
    return keys.apiKey;
  }
  
  console.log('🔍 No valid key found');
  return null;
}

export async function POST(req: Request) {
  try {
    const { description } = await req.json();
    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description is required and must be a string' },
        { status: 400 }
      );
    }
    const openaiKey = await getOpenAIKeyAsync();
    if (!openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }
    const openai = new OpenAI({ apiKey: openaiKey });
    // Compose the prompt for enhancement with advertising tone and character limit
    const prompt = `Transform this reward description into a concise, compelling advertisement. Use an exciting, action-oriented tone that creates urgency and desire. Keep it under 80 characters and avoid concluding sentences. Make it punchy and direct.\n\nOriginal: ${description}\n\nEnhanced:`;
    // Use gpt-4o, gpt-4-turbo, or fallback to gpt-3.5-turbo
    let model = 'gpt-4o';
    try {
      await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: 'You are a marketing copywriter specializing in creating compelling, concise reward descriptions with an advertising tone.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 60,
        temperature: 0.8,
      });
    } catch {
      // If gpt-4o is not available, fallback
      model = 'gpt-4-turbo';
      try {
        await openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You are a marketing copywriter specializing in creating compelling, concise reward descriptions with an advertising tone.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 60,
          temperature: 0.8,
        });
      } catch {
        model = 'gpt-3.5-turbo';
      }
    }
    // Actually get the completion
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are a marketing copywriter specializing in creating compelling, concise reward descriptions with an advertising tone.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 60,
      temperature: 0.8,
    });
    let enhancedDescription = completion.choices[0]?.message?.content?.trim() || description;
    
    // Ensure the enhanced description doesn't exceed 80 characters
    if (enhancedDescription.length > 80) {
      enhancedDescription = enhancedDescription.substring(0, 77) + '...';
    }
    
    return NextResponse.json({ enhancedDescription, originalDescription: description });
  } catch (error) {
    console.error('Error enhancing description:', error);
    return NextResponse.json(
      { error: 'Failed to enhance description' },
      { status: 500 }
    );
  }
} 