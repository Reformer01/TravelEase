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

    // Honest stub: validate shape + expiry (real inventory later)
    const ts = Date.now();
    const token = `av_${Math.random().toString(36).slice(2, 10)}_${ts}`;
    return NextResponse.json({ ok: true, token, items, expiresAt: ts + 20*60*1000 });
  } catch (e) {
    console.error('POST /api/availability/verify error', e);
    return NextResponse.json({ error: 'Unable to verify availability' }, { status: 500 });
  }
}
