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

    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_reference', reference)
      .eq('user_id', user.id)
      .maybeSingle();

    if (bookingErr) {
      console.error('Failed to fetch booking by reference', bookingErr);
      return NextResponse.json({ error: 'Unable to fetch booking' }, { status: 500 });
    }
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const { data: items, error: itemsErr } = await supabase
      .from('booking_items')
      .select('*')
      .eq('booking_id', booking.id)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });

    if (itemsErr) {
      console.error('Failed to fetch booking items', itemsErr);
      return NextResponse.json({ error: 'Unable to fetch booking' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, booking, items });
  } catch (e) {
    console.error('GET /api/bookings/by-reference error', e);
    return NextResponse.json({ error: 'Unable to fetch booking' }, { status: 500 });
  }
}
