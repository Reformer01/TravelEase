import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseUser } from '@/lib/supabase-auth';
import { createSupabaseAdminClient, createSupabaseRouteClient } from '@/lib/supabase-route';

type ModifyUpdates = {
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
};

async function resolveBookingForUser(supabase: ReturnType<typeof createSupabaseRouteClient>, userId: string, reference: string) {
  const isBookingReference = reference.startsWith('BK-');
  const query = supabase
    .from('bookings')
    .select('id,status,booking_date,location,title')
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
    const updates: ModifyUpdates = (body?.updates && typeof body.updates === 'object') ? body.updates : {};
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    const supabase = createSupabaseRouteClient(accessToken);

    const { booking, error: bookingErr } = await resolveBookingForUser(supabase, user.id, reference);
    if (bookingErr) {
      console.error('Failed to resolve booking for modify', bookingErr);
      return NextResponse.json({ error: 'Unable to find booking' }, { status: 500 });
    }
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot modify cancelled booking' }, { status: 400 });
    }

    const nextBookingDate = typeof updates.checkIn === 'string' && updates.checkIn.trim()
      ? new Date(updates.checkIn).toISOString()
      : null;

    if (!nextBookingDate) {
      return NextResponse.json({ error: 'Missing updates.checkIn' }, { status: 400 });
    }

    let admin;
    try {
      admin = createSupabaseAdminClient();
    } catch (e: any) {
      return NextResponse.json(
        {
          error: 'Modify failed and admin client unavailable.',
          detail: e?.message || 'Missing SUPABASE_SERVICE_ROLE_KEY',
        },
        { status: 500 }
      );
    }

    const { data: updated, error: updateErr } = await admin
      .from('bookings')
      .update({ booking_date: nextBookingDate, adults: updates.adults ?? 2, children: updates.children ?? 0 })
      .eq('id', booking.id)
      .eq('user_id', user.id)
      .select('*')
      .maybeSingle();

    if (updateErr) {
      console.error('Failed to modify booking', updateErr);
      return NextResponse.json({ error: 'Unable to modify booking' }, { status: 500 });
    }
    if (!updated) return NextResponse.json({ error: 'Modify did not affect any rows' }, { status: 409 });

    return NextResponse.json({ ok: true, booking: updated });
  } catch (e) {
    console.error('POST /api/bookings/modify error', e);
    return NextResponse.json({ error: 'Unable to modify booking' }, { status: 500 });
  }
}
