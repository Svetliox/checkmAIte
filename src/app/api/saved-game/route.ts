import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saveUserGame, getSavedGameById, getUserSavedGames, deleteSavedGame, deleteAllSavedGames } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Get single game by ID
    if (id) {
      const game = await getSavedGameById(session.user.id, id);
      if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, game });
    }

    // Get all games for user
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
    const games = await getUserSavedGames(session.user.id, order);
    return NextResponse.json({ success: true, games });
  } catch (error) {
    console.error('Get saved game error:', error);
    return NextResponse.json({ error: 'Failed to fetch saved games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { name, fen, turn, moveHistory, statistics, evaluationScore, gameType, evaluation, topMoves, difficulty, playerColor } = body;
    if (!fen || !turn || !moveHistory || !statistics || typeof evaluationScore !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Validate gameType if provided
    const validGameTypes = ['analysis', 'vsBot'];
    const safeGameType = validGameTypes.includes(gameType) ? gameType : 'analysis';
    
    await saveUserGame({
      userId: session.user.id,
      name,
      fen,
      turn,
      moveHistory,
      statistics,
      evaluationScore,
      gameType: safeGameType,
      evaluation: typeof evaluation === 'number' ? evaluation : null,
      topMoves: Array.isArray(topMoves) ? topMoves : null,
      difficulty: typeof difficulty === 'string' ? difficulty : null,
      playerColor: typeof playerColor === 'string' ? playerColor : null,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save game error:', error);
    return NextResponse.json({ error: 'Failed to save game' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all');

    // Delete all games
    if (all === 'true') {
      const count = await deleteAllSavedGames(session.user.id);
      return NextResponse.json({ success: true, deletedCount: count });
    }

    // Delete single game by ID
    if (id) {
      const deleted = await deleteSavedGame(session.user.id, id);
      if (!deleted) {
        return NextResponse.json({ error: 'Game not found or unauthorized' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Missing id or all parameter' }, { status: 400 });
  } catch (error) {
    console.error('Delete saved game error:', error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}