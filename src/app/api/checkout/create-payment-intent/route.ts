import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseUser } from '@/lib/supabase-auth';
import { createSupabaseRouteClient } from '@/lib/supabase-route';

export async function POST(request: NextRequest) {
  const { user, accessToken, error } = await requireSupabaseUser(request);
  if (!user || !accessToken) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const amount = Number(body?.amount);
    const currency = typeof body?.currency === 'string' ? body.currency : 'NGN';
    const items = Array.isArray(body?.items) ? body.items : [];
    const availabilityToken = typeof body?.availabilityToken === 'string' ? body.availabilityToken : null;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!availabilityToken) {
      return NextResponse.json({ error: 'Missing availabilityToken' }, { status: 400 });
    }

    const supabase = createSupabaseRouteClient(accessToken);

    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount,
        currency,
        provider: 'paystack',
        provider_ref: null,
        status: 'pending',
      })
      .select('*')
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      paymentId: payment.id,
      status: payment.status,
    });
  } catch (e) {
    console.error('POST /api/checkout/create-payment-intent error', e);
    return NextResponse.json({ error: 'Unable to create payment intent' }, { status: 500 });
  }
}
