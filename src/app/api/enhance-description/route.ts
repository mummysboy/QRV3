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
    // Compose the prompt for enhancement
    const prompt = `Rewrite the following reward description to be more compelling, clear, and customer-facing, while staying true to the original meaning. Make it sound appealing and friendly, but do not exaggerate or add details.\n\nOriginal: ${description}\n\nEnhanced:`;
    // Use gpt-4o, gpt-4-turbo, or fallback to gpt-3.5-turbo
    let model = 'gpt-4o';
    try {
      await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant for a customer rewards platform.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 120,
        temperature: 0.7,
      });
    } catch {
      // If gpt-4o is not available, fallback
      model = 'gpt-4-turbo';
      try {
        await openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant for a customer rewards platform.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 120,
          temperature: 0.7,
        });
      } catch {
        model = 'gpt-3.5-turbo';
      }
    }
    // Actually get the completion
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant for a customer rewards platform.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 120,
      temperature: 0.7,
    });
    const enhancedDescription = completion.choices[0]?.message?.content?.trim() || description;
    return NextResponse.json({ enhancedDescription, originalDescription: description });
  } catch (error) {
    console.error('Error enhancing description:', error);
    return NextResponse.json(
      { error: 'Failed to enhance description' },
      { status: 500 }
    );
  }
} 