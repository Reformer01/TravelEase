import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseUser } from '@/lib/supabase-auth';
import { createSupabaseRouteClient } from '@/lib/supabase-route';

export async function GET(request: NextRequest) {
  const { user, accessToken, error } = await requireSupabaseUser(request);
  if (!user || !accessToken) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }

  const reference = request.nextUrl.searchParams.get('reference');
  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
  }

  try {
    const supabase = createSupabaseRouteClient(accessToken);

    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .eq('booking_reference', reference)
      .single();

    if (bErr || !booking) {
      // Most common case: no booking found for this user + reference
      return NextResponse.json({ error: bErr?.message || 'Booking not found' }, { status: 404 });
    }

    const { data: items, error: iErr } = await supabase
      .from('booking_items')
      .select('*')
      .eq('booking_id', booking.id)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });

    if (iErr) {
      return NextResponse.json({ error: iErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, booking, items: items || [] });
  } catch (e) {
    console.error('GET /api/bookings/detail error', e);
    return NextResponse.json({ error: 'Unable to load booking' }, { status: 500 });
  }
}
