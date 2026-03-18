import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseUser } from '@/lib/supabase-auth';
import { createSupabaseRouteClient } from '@/lib/supabase-route';

function getPaystackSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('Missing PAYSTACK_SECRET_KEY');
  return key;
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

    const { data: payment, error: payErr } = await supabase
      .from('payments')
      .select('id,user_id,status,amount,currency,provider,provider_ref')
      .eq('id', reference)
      .single();

    if (payErr || !payment) {
      return NextResponse.json({ error: payErr?.message || 'Payment not found' }, { status: 404 });
    }

    if (payment.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If already succeeded, no need to re-verify.
    if (payment.status === 'succeeded') {
      return NextResponse.json({ ok: true, paymentId: payment.id, status: payment.status });
    }

    const resp = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${getPaystackSecretKey()}`,
      },
    });

    const json = await resp.json().catch(() => null);
    if (!resp.ok || !json?.status) {
      console.error('Paystack verify error', { status: resp.status, body: json });
      return NextResponse.json({ error: json?.message || 'Paystack verify failed' }, { status: 502 });
    }

    const data = json.data;
    const paystackStatus = String(data?.status || '');
    const verifiedAmountLowest = Number(data?.amount);
    const verifiedCurrency = String(data?.currency || payment.currency || 'USD');

    const expectedAmountLowest = Math.round(Number(payment.amount) * 100);

    let newStatus: 'pending' | 'succeeded' | 'failed' = 'pending';
    if (paystackStatus === 'success') {
      if (verifiedAmountLowest !== expectedAmountLowest || verifiedCurrency !== String(payment.currency)) {
        newStatus = 'failed';
      } else {
        newStatus = 'succeeded';
      }
    } else if (paystackStatus === 'failed' || paystackStatus === 'abandoned') {
      newStatus = 'failed';
    }

    const { error: updErr } = await supabase
      .from('payments')
      .update({ status: newStatus })
      .eq('id', payment.id)
      .eq('user_id', user.id);

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      paymentId: payment.id,
      status: newStatus,
      providerStatus: paystackStatus,
    });
  } catch (e) {
    console.error('POST /api/payments/paystack/verify error', e);
    return NextResponse.json({ error: 'Unable to verify payment' }, { status: 500 });
  }
}
