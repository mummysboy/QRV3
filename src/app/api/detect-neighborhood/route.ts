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
    const prompt = `What neighborhood would this address be considered? Use Google Maps data and local knowledge to determine the most accurate neighborhood name.

Business Name: ${businessName}
Address: ${address}

Please provide ONLY the specific neighborhood name that locals would recognize. Use official neighborhood names from Google Maps, real estate listings, and local knowledge.

Examples:
- "231 Cortland Ave, San Francisco, CA 94110" → "Bernal Heights" (not "Mission District")
- "1312 Chestnut St, San Francisco, CA 94123" → "Marina District"
- "Mission Street, San Francisco, CA 94110" → "Mission District"
- "170 O'Farrell St, San Francisco, CA 94102" → "Tenderloin"
- "925 Bush St, San Francisco, CA 94109" → "Nob Hill"
- "2123 Fillmore St, San Francisco, CA 94115" → "Pacific Heights"
- "734 La Playa St, San Francisco, CA 94121" → "Outer Richmond"

For San Francisco specifically, use these neighborhood names: Bernal Heights, Mission District, Marina District, Tenderloin, Nob Hill, Pacific Heights, Outer Richmond, Inner Richmond, North Beach, Russian Hill, Cow Hollow, Hayes Valley, Castro, Haight-Ashbury, Sunset, Richmond, Excelsior, Bayview, Potrero Hill, Dogpatch, South of Market (SoMa), Financial District, Chinatown, North Beach, Telegraph Hill, Russian Hill, Nob Hill, Pacific Heights, Presidio Heights, Laurel Heights, Inner Sunset, Outer Sunset, Golden Gate Heights, Forest Hill, West Portal, St. Francis Wood, Ingleside, Oceanview, Merced Heights, Lakeshore, Visitacion Valley, Crocker Amazon, Excelsior, Outer Mission, Mission Terrace, Glen Park, Diamond Heights, Twin Peaks, Mount Davidson, Forest Hill, West Portal, St. Francis Wood, Ingleside, Oceanview, Merced Heights, Lakeshore, Visitacion Valley, Crocker Amazon, Excelsior, Outer Mission, Mission Terrace, Glen Park, Diamond Heights, Twin Peaks, Mount Davidson.

Respond with only the neighborhood name, nothing else.`;
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