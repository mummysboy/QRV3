import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

function getOpenAIKey() {
  // Prefer project key (starts with proj-'), fallback to OPENAI_API_KEY
  const projectKey = process.env.OPENAI_PROJECT_KEY;
  const apiKey = process.env.OPENAI_API_KEY;
  
  console.log('🔍 Environment variables check:');
  console.log('🔍OPENAI_PROJECT_KEY exists:', !!projectKey);
  console.log('🔍OPENAI_PROJECT_KEY starts with proj-:', projectKey?.startsWith('proj-'));
  console.log('🔍OPENAI_PROJECT_KEY preview:', projectKey ? `${projectKey.substring(0, 4)}...` : 'not set');
  console.log('🔍 OPENAI_API_KEY exists:', !!apiKey);
  console.log('🔍 OPENAI_API_KEY preview:', apiKey ? `${apiKey.substring(0, 4)}...` : 'not set');
  
  if (projectKey && projectKey.startsWith('proj-')) {
    console.log('🔍 Using project key');
    return projectKey;
  }
  if (apiKey) {
    console.log('🔍 Using API key');
    return apiKey;
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
    const openaiKey = getOpenAIKey();
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