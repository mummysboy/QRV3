import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('🧪 Testing content moderation for:', content);

    // Call the content moderation API
    const moderationResponse = await fetch(`${request.headers.get('origin') || 'http://localhost:3000'}/api/content-moderation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (moderationResponse.ok) {
      const result = await moderationResponse.json();
      return NextResponse.json({
        success: true,
        testContent: content,
        moderationResult: result,
        isExplicit: result.isExplicit,
        message: result.message
      });
    } else {
      const errorData = await moderationResponse.json();
      return NextResponse.json({
        success: false,
        testContent: content,
        error: 'Content moderation API failed',
        details: errorData
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Test content moderation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Test with some sample content
  const testCases = [
    {
      content: "Get a free coffee with any purchase",
      expected: "SAFE"
    },
    {
      content: "Buy one get one free on all drinks",
      expected: "SAFE"
    },
    {
      content: "20% off your next visit",
      expected: "SAFE"
    },
    {
      content: "Free beer with any meal",
      expected: "EXPLICIT"
    },
    {
      content: "Get a free coffee and don't be a jerk",
      expected: "EXPLICIT"
    }
  ];

  const results = [];

  for (const testCase of testCases) {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/content-moderation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: testCase.content }),
      });

      if (response.ok) {
        const result = await response.json();
        results.push({
          content: testCase.content,
          expected: testCase.expected,
          actual: result.moderationResult,
          isCorrect: result.moderationResult === testCase.expected,
          isExplicit: result.isExplicit
        });
      } else {
        results.push({
          content: testCase.content,
          expected: testCase.expected,
          actual: 'ERROR',
          isCorrect: false,
          error: 'API call failed'
        });
      }
    } catch (error) {
      results.push({
        content: testCase.content,
        expected: testCase.expected,
        actual: 'ERROR',
        isCorrect: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return NextResponse.json({
    success: true,
    testResults: results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.isCorrect).length,
      failed: results.filter(r => !r.isCorrect).length
    }
  });
} 