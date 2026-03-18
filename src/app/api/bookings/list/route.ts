import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseUser } from '@/lib/supabase-auth';
import { createSupabaseRouteClient } from '@/lib/supabase-route';

export async function GET(request: NextRequest) {
  const { user, accessToken, error } = await requireSupabaseUser(request);
  if (!user || !accessToken) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createSupabaseRouteClient(accessToken);
    const { data, error: listErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (listErr) {
      return NextResponse.json({ error: listErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, bookings: data || [] });
  } catch (e) {
    console.error('GET /api/bookings/list error', e);
    return NextResponse.json({ error: 'Unable to list bookings' }, { status: 500 });
  }
}
