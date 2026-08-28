import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseUser } from '@/lib/supabase-auth';
import { createSupabaseAdminClient, createSupabaseRouteClient } from '@/lib/supabase-route';

async function resolveBookingIdForUser(supabase: ReturnType<typeof createSupabaseRouteClient>, userId: string, reference: string) {
  const isBookingReference = reference.startsWith('BK-');
  const query = supabase
    .from('bookings')
    .select('id,status')
    .eq('user_id', userId);

  const { data, error } = isBookingReference
    ? await query.eq('booking_reference', reference).maybeSingle()
    : await query.eq('id', reference).maybeSingle();

  return { booking: data, error };
}

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

    const { booking, error: bookingErr } = await resolveBookingIdForUser(supabase, user.id, reference);
    if (bookingErr) {
      console.error('Failed to resolve booking for cancel', bookingErr);
      return NextResponse.json({ error: 'Unable to find booking' }, { status: 500 });
    }
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    if (booking.status === 'cancelled') {
      return NextResponse.json({ ok: true, alreadyCancelled: true });
    }

    let admin;
    try {
      admin = createSupabaseAdminClient();
    } catch (e: any) {
      return NextResponse.json(
        {
          error: 'Cancel failed and admin client unavailable.',
          detail: e?.message || 'Missing SUPABASE_SERVICE_ROLE_KEY',
        },
        { status: 500 }
      );
    }

    const { data: updated, error: updateErr } = await admin
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', booking.id)
      .eq('user_id', user.id)
      .select('*')
      .maybeSingle();

    if (updateErr) {
      console.error('Failed to cancel booking', updateErr);
      return NextResponse.json({ error: 'Unable to cancel booking' }, { status: 500 });
    }
    if (!updated) return NextResponse.json({ error: 'Cancel did not affect any rows' }, { status: 409 });

    return NextResponse.json({ ok: true, booking: updated });
  } catch (e) {
    console.error('POST /api/bookings/cancel error', e);
    return NextResponse.json({ error: 'Unable to cancel booking' }, { status: 500 });
  }
}
