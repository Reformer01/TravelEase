import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseUser } from '@/lib/supabase-auth';
import { createSupabaseAdminClient, createSupabaseRouteClient } from '@/lib/supabase-route';

function isMissingDeletedAtColumn(err: unknown): boolean {
  const anyErr = err as any;
  const msg = String(anyErr?.message || '');
  const code = String(anyErr?.code || '');
  return (
    (msg.includes('deleted_at') && msg.includes('does not exist')) ||
    code === '42703'
  );
}

async function resolveBookingIdForUser(supabase: ReturnType<typeof createSupabaseRouteClient>, userId: string, reference: string) {
  const isBookingReference = reference.startsWith('BK-');
  const query = supabase
    .from('bookings')
    .select('id')
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
    if (bookingErr) return NextResponse.json({ error: bookingErr.message }, { status: 500 });
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    // Soft delete: mark as deleted instead of hard-deleting
    const { data: updated, error: updateErr } = await supabase
      .from('bookings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', booking.id)
      .eq('user_id', user.id)
      .select('*')
      .maybeSingle();

    if (updateErr) {
      if (isMissingDeletedAtColumn(updateErr)) {
        const { data: statusUpdated, error: statusUpdateErr } = await supabase
          .from('bookings')
          .update({ status: 'deleted' })
          .eq('id', booking.id)
          .eq('user_id', user.id)
          .select('*')
          .maybeSingle();

        if (!statusUpdateErr) {
          return NextResponse.json({ ok: true, deletedWith: 'user_status', booking: statusUpdated });
        }

        const { error: hardDelErr } = await supabase
          .from('bookings')
          .delete()
          .eq('id', booking.id)
          .eq('user_id', user.id);

        if (!hardDelErr) {
          return NextResponse.json({ ok: true, deletedWith: 'user_hard' });
        }

        let admin;
        try {
          admin = createSupabaseAdminClient();
        } catch (e: any) {
          return NextResponse.json(
            {
              error: 'Hard delete failed and admin client unavailable.',
              detail: e?.message || 'Missing SUPABASE_SERVICE_ROLE_KEY',
            },
            { status: 500 }
          );
        }

        const { error: adminHardDelErr } = await admin
          .from('bookings')
          .delete()
          .eq('id', booking.id)
          .eq('user_id', user.id);

        if (adminHardDelErr) {
          return NextResponse.json({ error: adminHardDelErr.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true, deletedWith: 'admin_hard' });
      }

      // If soft delete fails with user client, try admin client
      let admin;
      try {
        admin = createSupabaseAdminClient();
      } catch (e: any) {
        return NextResponse.json(
          {
            error: 'Soft delete failed and admin client unavailable.',
            detail: e?.message || 'Missing SUPABASE_SERVICE_ROLE_KEY',
          },
          { status: 500 }
        );
      }

      const { data: adminUpdated, error: adminUpdateErr } = await admin
        .from('bookings')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', booking.id)
        .eq('user_id', user.id)
        .select('*')
        .maybeSingle();

      if (adminUpdateErr) {
        return NextResponse.json({ error: adminUpdateErr.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, deletedWith: 'admin', booking: adminUpdated });
    }

    return NextResponse.json({ ok: true, deletedWith: 'user', booking: updated });
  } catch (e) {
    console.error('POST /api/bookings/delete error', e);
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: 'Unable to delete booking', detail: message }, { status: 500 });
  }
}
