import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { getOpenAIKeys, getOpenAIKey } from '@/lib/aws-secrets';

async function getOpenAIKeyAsync() {
  const envKey = getOpenAIKey();
  if (envKey) return envKey;
  const keys = await getOpenAIKeys();
  if (keys.projectKey && keys.projectKey.startsWith('proj-')) return keys.projectKey;
  if (keys.apiKey && keys.apiKey.startsWith('sk-')) return keys.apiKey;
  return null;
}

export async function POST(req: Request) {
  try {
    const { businessName, address } = await req.json();
    if (!businessName || !address) {
      return NextResponse.json({ error: 'businessName and address are required' }, { status: 400 });
    }
    const openaiKey = await getOpenAIKeyAsync();
    if (!openaiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }
    const openai = new OpenAI({ apiKey: openaiKey });
    const prompt = `Given a business name and address, determine the specific neighborhood or district where this business is located. 

Business Name: ${businessName}
Address: ${address}

Please provide ONLY the specific neighborhood or district name (e.g., "East Mesa", "Marina District", "Mission District", "Downtown", "Westside", "Riviera", etc.). Every business or address has a neighborhood or district so there must be an answer.

Examples:
- "Mesa Cafe & Bar at 1972 Cliff Dr, Santa Barbara, CA 93109" → "East Mesa" (not "Santa Barbara")
- "Union Street Coffee Roastery at 2191 Unions, San Francisco, CA 94123" → "Marina District" (not "San Francisco")
- "Daily Grind at 2001 De La Vina St, Santa Barbara, CA 93105" → "De La Vina District" or "Upper State" (not "Santa Barbara")

Respond with only the neighborhood/district name, nothing else.`;
    let model = 'gpt-4o';
    try {
      await openai.chat.completions.create({ model, messages: [ { role: 'user', content: prompt } ], max_tokens: 20, temperature: 0 });
    } catch {
      model = 'gpt-4-turbo';
      try {
        await openai.chat.completions.create({ model, messages: [ { role: 'user', content: prompt } ], max_tokens: 20, temperature: 0 });
      } catch {
        model = 'gpt-3.5-turbo';
      }
    }
    const completion = await openai.chat.completions.create({ model, messages: [ { role: 'user', content: prompt } ], max_tokens: 20, temperature: 0 });
    let neighborhood = completion.choices[0]?.message?.content?.trim() || '';
    // Remove any extra text, keep only the first line
    neighborhood = neighborhood.split('\n')[0];
    return NextResponse.json({ neighborhood });
  } catch (error) {
    console.error('Error detecting neighborhood:', error);
    return NextResponse.json({ error: 'Failed to detect neighborhood' }, { status: 500 });
  }
} 