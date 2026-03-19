import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseUser } from '@/lib/supabase-auth';
import { createSupabaseRouteClient } from '@/lib/supabase-route';

function isMissingDeletedAtColumn(err: unknown): boolean {
  const anyErr = err as any;
  const msg = String(anyErr?.message || '');
  const code = String(anyErr?.code || '');
  return (
    (msg.includes('deleted_at') && msg.includes('does not exist')) ||
    code === '42703'
  );
}

export async function GET(request: NextRequest) {
  const { user, accessToken, error } = await requireSupabaseUser(request);
  if (!user || !accessToken) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createSupabaseRouteClient(accessToken);
    const buildBaseQuery = () =>
      supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    const { data, error: listErr } = await buildBaseQuery().is('deleted_at', null);
    if (!listErr) {
      return NextResponse.json({ ok: true, bookings: data || [] });
    }

    if (!isMissingDeletedAtColumn(listErr)) {
      return NextResponse.json({ error: listErr.message }, { status: 500 });
    }

    const { data: data2, error: listErr2 } = await buildBaseQuery();
    if (listErr2) {
      return NextResponse.json({ error: listErr2.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, bookings: data2 || [] });
  } catch (e) {
    console.error('GET /api/bookings/list error', e);
    return NextResponse.json({ error: 'Unable to list bookings' }, { status: 500 });
  }
}
