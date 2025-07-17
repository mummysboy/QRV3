import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

function getOpenAIKey() {
  // Prefer project key (starts with proj-'), fallback to OPENAI_API_KEY
  const projectKey = process.env.OPENAI_PROJECT_KEY;
  const apiKey = process.env.OPENAI_API_KEY;
  
  console.log('🔍 OpenAI Environment Variables Check:');
  console.log('🔍 OPENAI_PROJECT_KEY exists:', !!projectKey);
  console.log('🔍 OPENAI_PROJECT_KEY starts with proj-:', projectKey?.startsWith('proj-'));
  console.log('🔍 OPENAI_PROJECT_KEY preview:', projectKey ? `${projectKey.substring(0, 4)}...` : 'not set');
  console.log('🔍 OPENAI_API_KEY exists:', !!apiKey);
  console.log('🔍 OPENAI_API_KEY preview:', apiKey ? `${apiKey.substring(0, 4)}...` : 'not set');
  
  if (projectKey && projectKey.startsWith('proj-')) {
    console.log('🔍 Using project key');
    return { key: projectKey, type: 'project' };
  }
  if (apiKey) {
    console.log('🔍 Using API key');
    return { key: apiKey, type: 'api' };
  }
  console.log('🔍 No valid key found');
  return null;
}

export async function GET() {
  console.log('🧪 OpenAI Test endpoint called');
  
  try {
    const keyInfo = getOpenAIKey();
    
    if (!keyInfo) {
      return NextResponse.json({
        success: false,
        message: 'No OpenAI API key configured',
        environment: {
          OPENAI_PROJECT_KEY: {
            exists: !!process.env.OPENAI_PROJECT_KEY,
            preview: process.env.OPENAI_PROJECT_KEY ? `${process.env.OPENAI_PROJECT_KEY.substring(0, 4)}...` : 'not set',
            isValid: process.env.OPENAI_PROJECT_KEY?.startsWith('proj-') || false
          },
          OPENAI_API_KEY: {
            exists: !!process.env.OPENAI_API_KEY,
            preview: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 4)}...` : 'not set',
            isValid: !!process.env.OPENAI_API_KEY
          }
        }
      }, { status: 500 });
    }

    // Test the API key by making a simple request
    const openai = new OpenAI({ apiKey: keyInfo.key });
    
    try {
      const testResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Hello! This is a test message.' }
        ],
        max_tokens: 10,
        temperature: 0,
      });

      return NextResponse.json({
        success: true,
        message: 'OpenAI API key is valid and working',
        keyType: keyInfo.type,
        keyPreview: `${keyInfo.key.substring(0, 4)}...`,
        testResponse: {
          model: testResponse.model,
          usage: testResponse.usage,
          responsePreview: testResponse.choices[0]?.message?.content?.substring(0, 50) + '...'
        },
        environment: {
          OPENAI_PROJECT_KEY: {
            exists: !!process.env.OPENAI_PROJECT_KEY,
            preview: process.env.OPENAI_PROJECT_KEY ? `${process.env.OPENAI_PROJECT_KEY.substring(0, 4)}...` : 'not set',
            isValid: process.env.OPENAI_PROJECT_KEY?.startsWith('proj-') || false
          },
          OPENAI_API_KEY: {
            exists: !!process.env.OPENAI_API_KEY,
            preview: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 4)}...` : 'not set',
            isValid: !!process.env.OPENAI_API_KEY
          }
        }
      });
    } catch (apiError: unknown) {
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';
      const errorType = apiError instanceof Error ? apiError.constructor.name : 'unknown';
      
      return NextResponse.json({
        success: false,
        message: 'OpenAI API key is configured but test request failed',
        keyType: keyInfo.type,
        keyPreview: `${keyInfo.key.substring(0, 4)}...`,
        error: errorMessage,
        errorType: errorType,
        environment: {
          OPENAI_PROJECT_KEY: {
            exists: !!process.env.OPENAI_PROJECT_KEY,
            preview: process.env.OPENAI_PROJECT_KEY ? `${process.env.OPENAI_PROJECT_KEY.substring(0, 4)}...` : 'not set',
            isValid: process.env.OPENAI_PROJECT_KEY?.startsWith('proj-') || false
          },
          OPENAI_API_KEY: {
            exists: !!process.env.OPENAI_API_KEY,
            preview: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 4)}...` : 'not set',
            isValid: !!process.env.OPENAI_API_KEY
          }
        }
      }, { status: 500 });
    }
  } catch (error: unknown) {
    console.error('❌ OpenAI test error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      message: 'OpenAI test failed',
      error: errorMessage,
      environment: {
        OPENAI_PROJECT_KEY: {
          exists: !!process.env.OPENAI_PROJECT_KEY,
          preview: process.env.OPENAI_PROJECT_KEY ? `${process.env.OPENAI_PROJECT_KEY.substring(0, 4)}...` : 'not set',
          isValid: process.env.OPENAI_PROJECT_KEY?.startsWith('proj-') || false
        },
        OPENAI_API_KEY: {
          exists: !!process.env.OPENAI_API_KEY,
          preview: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 4)}...` : 'not set',
          isValid: !!process.env.OPENAI_API_KEY
        }
      }
    }, { status: 500 });
  }
} 