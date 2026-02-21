import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, AIChatRequest, AIChatResponse } from '@/types';
import { buildChatPrompt } from '@/lib/chess/promptBuilder';
import { auth } from '@/lib/auth';
import { getUserApiKey } from '@/lib/db';

/**
 * AI Chat API Route Handler
 * 
 * POST /api/chat
 * Generates friendly AI commentary about the current chess position.
 * 
 * Uses Groq API with alternating models for variety:
 * - llama-3.1-8b-instant (fast, good quality)
 * - gemma2-9b-it (alternative perspective)
 * 
 * API Key Priority:
 * 1. User's stored API key (from account settings)
 * 2. System GROQ_API_KEY environment variable (fallback)
 * 
 * Request body:
 * - fen: string (FEN notation of the position)
 * - moveHistory: string[] (list of moves played)
 * - moveNumber: number (current move number)
 * - gameMode: 'analysis' | 'vsBot'
 */

// Track which model to use next (alternates between requests)
let modelToggle = false;

const GROQ_MODELS = [
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
];

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<AIChatResponse>>> {
  try {
    const body = (await request.json()) as AIChatRequest;

    // Validate required fields
    if (!body.fen || typeof body.fen !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: FEN position is required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.moveHistory)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: moveHistory array is required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    let apiKey: string | null = null;
    
    // Try to get user's API key
    const session = await auth();
    if (session?.user?.id) {
      try {
        apiKey = await getUserApiKey(session.user.id, 'groq');
      } catch (err) {
        console.warn('[API] Failed to get user API key:', err);
      }
    }

    if (!apiKey) {
      apiKey = process.env.GROQ_API_KEY || null;
    }

    if (!apiKey) {
      console.warn('[API] No API key available for chat');
      return NextResponse.json({
        success: true,
        data: {
          success: true,
          message: 'API_KEY_REQUIRED',
          model: 'none',
        },
        timestamp: new Date().toISOString(),
      });
    }

    const model = GROQ_MODELS[modelToggle ? 1 : 0];
    modelToggle = !modelToggle;

    const messages = buildChatPrompt(body);

    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 200,
        top_p: 0.9,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('[API] Groq API error:', groqResponse.status, errorText);
      
      return NextResponse.json({
        success: true,
        data: {
          success: true,
          message: getFallbackMessage(body.moveHistory.length),
          model: 'fallback',
        },
        timestamp: new Date().toISOString(),
      });
    }

    const groqData = await groqResponse.json();
    const aiMessage = groqData.choices?.[0]?.message?.content || getFallbackMessage(body.moveHistory.length);

    return NextResponse.json({
      success: true,
      data: {
        success: true,
        message: aiMessage.trim(),
        model,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[API] Chat error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during chat generation',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

function getFallbackMessage(moveCount: number): string {
  const fallbackMessages = [
    "The game is developing nicely! Keep those pieces active.",
    "Interesting position! Both sides have chances here.",
    "Chess is a battle of ideas - and you're making some good ones!",
    "Every master was once a beginner. Keep playing!",
    "The board is telling a story - what's your next chapter?",
    "Remember: knights on the rim are dim, but creativity knows no bounds!",
    "Pawns are the soul of chess - are yours happy where they are?",
    "Position, position, position - the three rules of chess real estate!",
  ];

  const index = moveCount % fallbackMessages.length;
  return fallbackMessages[index];
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    endpoint: '/api/chat',
    description: 'AI-powered chess commentary and analysis',
    methods: ['POST'],
    body: {
      fen: 'string (required) - FEN notation of current position',
      moveHistory: 'string[] (required) - Array of moves in SAN notation',
      moveNumber: 'number (required) - Current move number',
      gameMode: "'analysis' | 'vsBot' (required) - Current game mode",
    },
    response: {
      message: 'string - AI commentary about the position',
      model: 'string - Which AI model generated the response',
      success: 'boolean - Whether the request succeeded',
    },
    note: 'Requires GROQ_API_KEY environment variable for full functionality',
  });
}
