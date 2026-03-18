import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseUser } from '@/lib/supabase-auth';
import { createSupabaseAdminClient, createSupabaseRouteClient } from '@/lib/supabase-route';

export async function POST(request: NextRequest) {
  const { user, accessToken, error } = await requireSupabaseUser(request);
  if (!user || !accessToken) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const reference = typeof body?.reference === 'string' ? body.reference : null;
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    const supabase = createSupabaseRouteClient(accessToken);

    // Find booking (ownership enforced here). The client route param can be booking_reference (BK-...) OR booking UUID.
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', user.id)
      .or(`booking_reference.eq.${reference},id.eq.${reference}`)
      .maybeSingle();

    if (bookingErr) {
      return NextResponse.json({ error: bookingErr.message }, { status: 500 });
    }

    // Make cancellation idempotent. If already deleted, treat as success.
    if (!booking) {
      return NextResponse.json({ ok: true, alreadyDeleted: true });
    }

    // Delete using service role to reliably bypass RLS, after ownership check above.
    let admin;
    try {
      admin = createSupabaseAdminClient();
    } catch (e: any) {
      console.error('Failed to create Supabase admin client', e);
      return NextResponse.json({ error: e?.message || 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    // Delete booking items first to avoid FK constraint issues.
    const { error: delItemsErr } = await admin
      .from('booking_items')
      .delete()
      .eq('booking_id', booking.id);

    if (delItemsErr) {
      console.error('Failed to delete booking_items for booking', { bookingId: booking.id, error: delItemsErr });
      return NextResponse.json({ error: delItemsErr.message }, { status: 500 });
    }

    const { error: delBookingErr } = await admin
      .from('bookings')
      .delete()
      .eq('id', booking.id)
      .eq('user_id', user.id);

    if (delBookingErr) {
      console.error('Failed to delete booking for user', { bookingId: booking.id, userId: user.id, error: delBookingErr });
      return NextResponse.json({ error: delBookingErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('POST /api/bookings/cancel error', e);
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: 'Unable to cancel booking', detail: message }, { status: 500 });
  }
}
