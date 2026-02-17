import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, AnalysisResult, ChessPosition } from '@/types';

/**
 * Analysis API Route Handler
 * 
 * POST /api/analysis
 * Analyzes a chess position and returns engine evaluation.
 * 
 * Request body:
 * - fen: string (FEN notation of the position)
 * - depth?: number (optional analysis depth, defaults to 20)
 * 
 * TODO: Integrate with actual Stockfish WASM engine
 */

interface AnalysisRequest {
  fen: ChessPosition;
  depth?: number;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<AnalysisResult>>> {
  try {
    const body = (await request.json()) as AnalysisRequest;

    // Validate FEN
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

    // Basic FEN validation (check structure)
    const fenParts = body.fen.split(' ');
    if (fenParts.length < 1 || fenParts.length > 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid FEN notation',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const depth = body.depth || 20;

    // TODO: Replace with actual Stockfish analysis
    // For now, return mock analysis data
    const mockAnalysis: AnalysisResult = {
      bestMove: {
        from: 'e2',
        to: 'e4',
        san: 'e4',
      },
      evaluation: 30, // +0.30 in centipawns
      depth: depth,
      pv: [
        { from: 'e2', to: 'e4', san: 'e4' },
        { from: 'e7', to: 'e5', san: 'e5' },
        { from: 'g1', to: 'f3', san: 'Nf3' },
        { from: 'b8', to: 'c6', san: 'Nc6' },
      ],
      nodes: 1500000,
      time: 300,
    };

    return NextResponse.json({
      success: true,
      data: mockAnalysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Analysis error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during analysis',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analysis
 * Returns information about the analysis endpoint.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    endpoint: '/api/analysis',
    method: 'POST',
    description: 'Analyze a chess position using Stockfish engine',
    requestBody: {
      fen: {
        type: 'string',
        required: true,
        description: 'FEN notation of the chess position',
      },
      depth: {
        type: 'number',
        required: false,
        default: 20,
        description: 'Analysis depth (1-30)',
      },
    },
    response: {
      bestMove: 'The best move in the position',
      evaluation: 'Position evaluation in centipawns',
      depth: 'Search depth reached',
      pv: 'Principal variation (best line)',
      nodes: 'Number of nodes searched',
      time: 'Time spent in milliseconds',
    },
  });
}
