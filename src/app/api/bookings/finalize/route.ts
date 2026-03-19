import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseUser } from '@/lib/supabase-auth';
import { createSupabaseRouteClient } from '@/lib/supabase-route';

function generateReference(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  const { user, accessToken, error } = await requireSupabaseUser(request);
  if (!user || !accessToken) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const paymentId = typeof body?.paymentId === 'string' ? body.paymentId : null;
    // Default to NGN if not specified - Paystack supports NGN for Nigerian merchants
    const currency = typeof body?.currency === 'string' ? body.currency : (process.env.PAYMENT_CURRENCY || 'NGN');

    if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });

    const supabase = createSupabaseRouteClient(accessToken);

    const { data: payment, error: payErr } = await supabase
      .from('payments')
      .select('id,user_id,status,amount,currency')
      .eq('id', paymentId)
      .single();

    if (payErr || !payment) {
      return NextResponse.json({ error: payErr?.message || 'Payment not found' }, { status: 404 });
    }

    if (payment.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (payment.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 409 });
    }

    const { data: basketRows, error: basketErr } = await supabase
      .from('basket_items')
      .select('id,snapshot')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (basketErr) {
      return NextResponse.json({ error: basketErr.message }, { status: 500 });
    }

    const items = (basketRows || []).map((r: any) => ({ ...r.snapshot, basketId: r.id }));
    if (items.length === 0) {
      return NextResponse.json({ error: 'Basket is empty' }, { status: 409 });
    }

    const subtotal = items.reduce((sum: number, item: any) => sum + Number(item.price || 0), 0);
    if (!Number.isFinite(subtotal) || subtotal <= 0) {
      return NextResponse.json({ error: 'Invalid basket total' }, { status: 409 });
    }

    // Must match checkout UI calculation to prevent mismatches.
    const taxesAndFees = Math.floor(subtotal * 0.1);
    const serviceFee = Math.floor(subtotal * 0.02);
    const grandTotal = subtotal + taxesAndFees + serviceFee;

    // Ensure payment amount matches what we are booking.
    if (Number(payment.amount) !== grandTotal) {
      return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 409 });
    }

    // Check if booking already exists for this payment (idempotency)
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id, booking_reference')
      .eq('payment_id', paymentId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingBooking) {
      return NextResponse.json({ ok: true, bookingId: existingBooking.id, bookingReference: existingBooking.booking_reference, alreadyExists: true });
    }

    const bookingReference = generateReference('BK');

    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        payment_id: payment.id,
        booking_reference: bookingReference,
        status: 'confirmed',
        total_amount: grandTotal,
        currency: payment.currency || currency,
        location: items?.[0]?.location || 'Global',
        title: items?.[0]?.title || 'Travel Package',
        image: items?.[0]?.image || '',
        booking_date: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (bookingErr) {
      return NextResponse.json({ error: bookingErr.message }, { status: 500 });
    }

    const bookingItemsPayload = items.map((item: any) => ({
      booking_id: booking.id,
      snapshot: item,
    }));

    const { error: itemsErr } = await supabase.from('booking_items').insert(bookingItemsPayload);
    if (itemsErr) {
      return NextResponse.json({ error: itemsErr.message }, { status: 500 });
    }

    // Clear basket after successful booking.
    const { error: clearErr } = await supabase.from('basket_items').delete().eq('user_id', user.id);
    if (clearErr) {
      console.error('Failed to clear basket after booking', clearErr);
    }

    return NextResponse.json({ ok: true, bookingId: booking.id, bookingReference: booking.booking_reference });
  } catch (e) {
    console.error('POST /api/bookings/finalize error', e);
    return NextResponse.json({ error: 'Unable to finalize booking' }, { status: 500 });
  }
}
