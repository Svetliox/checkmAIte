

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserApiKey, saveUserApiKey, deleteUserApiKey, hasUserApiKey } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'groq';

    const hasKey = await hasUserApiKey(session.user.id, provider);

    return NextResponse.json({ hasKey, provider });
  } catch (error) {
    console.error('API key check error:', error);
    return NextResponse.json({ error: 'Failed to check API key' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { provider, key } = body;

    if (!provider || !key) {
      return NextResponse.json({ error: 'Provider and key are required' }, { status: 400 });
    }

    if (provider === 'groq' && !key.startsWith('gsk_')) {
      return NextResponse.json(
        { error: 'Invalid Groq API key format. Keys should start with "gsk_"' },
        { status: 400 }
      );
    }

    await saveUserApiKey(session.user.id, provider, key);

    return NextResponse.json({ success: true, message: 'API key saved successfully' });
  } catch (error) {
    console.error('API key save error:', error);
    return NextResponse.json({ error: 'Failed to save API key' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'groq';

    await deleteUserApiKey(session.user.id, provider);

    return NextResponse.json({ success: true, message: 'API key deleted successfully' });
  } catch (error) {
    console.error('API key delete error:', error);
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 });
  }
}
