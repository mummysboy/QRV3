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
  
  return null;
}

export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
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
    
    // Content moderation prompt
    const moderationPrompt = `Analyze the following reward description for explicit, inappropriate, or offensive content. 

Consider the following categories as explicit/inappropriate:
- Sexual content or innuendos
- Violence or threats
- Hate speech or discrimination
- Profanity or vulgar language (including mild profanity like "jerk", "stupid", etc.)
- Drug or alcohol references (including beer, wine, liquor, etc.)
- Scam or fraudulent content
- Inappropriate humor or offensive jokes
- Any content that would not be suitable for all ages

Reward description: "${content}"

Be strict in your assessment. If there is ANY potentially inappropriate content, mark it as EXPLICIT.

Respond with ONLY "SAFE" if the content is completely appropriate for a family-friendly reward platform, or "EXPLICIT" if it contains any of the above inappropriate content. Do not include any other text in your response.`;

    // Use gpt-4o, gpt-4-turbo, or fallback to gpt-3.5-turbo
    let model = 'gpt-4o';
    try {
      await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: 'You are a content moderator for a family-friendly reward platform. You must respond with only "SAFE" or "EXPLICIT".' },
          { role: 'user', content: moderationPrompt }
        ],
        max_tokens: 10,
        temperature: 0,
      });
    } catch {
      // If gpt-4o is not available, fallback
      model = 'gpt-4-turbo';
      try {
        await openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You are a content moderator for a family-friendly reward platform. You must respond with only "SAFE" or "EXPLICIT".' },
            { role: 'user', content: moderationPrompt }
          ],
          max_tokens: 10,
          temperature: 0,
        });
      } catch {
        model = 'gpt-3.5-turbo';
      }
    }
    
    // Actually get the completion
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are a content moderator for a family-friendly reward platform. You must respond with only "SAFE" or "EXPLICIT".' },
        { role: 'user', content: moderationPrompt }
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const result = completion.choices[0]?.message?.content?.trim().toUpperCase();
    
    console.log('🔍 Content moderation result:', result);
    
    const isExplicit = result === 'EXPLICIT';
    
    return NextResponse.json({
      success: true,
      isExplicit,
      content: content,
      moderationResult: result,
      message: isExplicit 
        ? 'Sorry, it looks like there is explicit content in this reward' 
        : 'Content is appropriate'
    });
    
  } catch (error) {
    console.error('❌ Content moderation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to moderate content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 