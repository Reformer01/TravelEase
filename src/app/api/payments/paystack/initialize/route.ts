import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseUser } from '@/lib/supabase-auth';
import { createSupabaseRouteClient } from '@/lib/supabase-route';

function getPaystackSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('Missing PAYSTACK_SECRET_KEY');
  return key;
}

async function getSupportedCurrency(): Promise<string> {
  // Default to NGN as it's the most commonly supported currency for Paystack test accounts
  const defaultCurrency = 'NGN';
  
  try {
    // Test if USD is supported by making a minimal test request
    const testResp = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getPaystackSecretKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        amount: 100, // 1 NGN in lowest unit
        currency: 'USD',
        reference: `currency-test-${Date.now()}`,
      }),
    });

    if (testResp.ok) {
      return 'USD';
    }
    
    const testJson = await testResp.json().catch(() => null);
    if (testJson?.message?.includes('Currency not supported')) {
      console.warn('USD not supported by merchant, falling back to NGN');
      return defaultCurrency;
    }
    
    return defaultCurrency;
  } catch (error) {
    console.warn('Failed to detect supported currency, defaulting to NGN:', error);
    return defaultCurrency;
  }
}

export async function POST(request: NextRequest) {
  const { user, accessToken, error } = await requireSupabaseUser(request);
  if (!user || !accessToken) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const amount = Number(body?.amount);
    const requestedCurrency = typeof body?.currency === 'string' ? body.currency : (process.env.PAYMENT_CURRENCY || 'USD');
    const items = Array.isArray(body?.items) ? body.items : [];
    const availabilityToken = typeof body?.availabilityToken === 'string' ? body.availabilityToken : null;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (!availabilityToken) {
      return NextResponse.json({ error: 'Missing availabilityToken' }, { status: 400 });
    }

    // Detect supported currency and fallback if necessary
    let currency = requestedCurrency;
    if (currency === 'USD') {
      const supportedCurrency = await getSupportedCurrency();
      if (supportedCurrency !== 'USD') {
        currency = supportedCurrency;
        console.log(`Currency fallback: ${requestedCurrency} → ${currency}`);
      }
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

    if (insertError || !payment) {
      return NextResponse.json({ error: insertError?.message || 'Unable to create payment' }, { status: 500 });
    }

    // Use our payment UUID as Paystack reference to keep mapping 1:1.
    const reference = String(payment.id);

    const origin = new URL(request.url).origin;
    const callback_url = `${origin}/checkout/complete?reference=${encodeURIComponent(reference)}`;

    // Paystack expects amount in the lowest currency unit.
    // For NGN this is kobo; for USD this is cents.
    const amountInLowestUnit = Math.round(amount * 100);

    const resp = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getPaystackSecretKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: amountInLowestUnit,
        currency,
        reference,
        callback_url,
        metadata: {
          payment_id: payment.id,
          availability_token: availabilityToken,
          // Non-authoritative snapshot for UX/debug only.
          items,
        },
      }),
    });

    const json = await resp.json().catch(() => null);
    if (!resp.ok || !json?.status) {
      console.error('Paystack initialize error', { status: resp.status, body: json });
      return NextResponse.json({ error: json?.message || 'Paystack initialize failed' }, { status: 502 });
    }

    const authorizationUrl = json.data?.authorization_url as string | undefined;
    if (!authorizationUrl) {
      return NextResponse.json({ error: 'Missing authorization_url from Paystack' }, { status: 502 });
    }

    const { error: updErr } = await supabase
      .from('payments')
      .update({ provider_ref: reference })
      .eq('id', payment.id)
      .eq('user_id', user.id);

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      paymentId: payment.id,
      reference,
      authorizationUrl,
    });
  } catch (e) {
    console.error('POST /api/payments/paystack/initialize error', e);
    return NextResponse.json({ error: 'Unable to initialize Paystack payment' }, { status: 500 });
  }
}
