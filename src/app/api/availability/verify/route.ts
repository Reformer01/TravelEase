import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseUser } from '@/lib/supabase-auth';

export async function POST(request: NextRequest) {
  const { user, error } = await requireSupabaseUser(request);
  if (!user) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : null;
    if (!items) {
      return NextResponse.json({ error: 'Missing items' }, { status: 400 });
    }

    // TODO: Replace with real inventory validation.
    // For now we only validate shape and return a short-lived token.
    const token = `av_${Math.random().toString(36).slice(2, 10)}`;
    return NextResponse.json({ ok: true, token, items });
  } catch (e) {
    console.error('POST /api/availability/verify error', e);
    return NextResponse.json({ error: 'Unable to verify availability' }, { status: 500 });
  }
}
