import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseAdminClient } from '@/lib/supabase-route';

function getPaystackSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('Missing PAYSTACK_SECRET_KEY');
  return key;
}

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(request: NextRequest) {
  // Webhook must be validated and processed with service role to bypass RLS.
  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature') || '';

  const hash = crypto.createHmac('sha512', getPaystackSecretKey()).update(rawBody).digest('hex');
  if (!signature || !timingSafeEqual(signature, hash)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const event = String(payload?.event || '');
  const data = payload?.data;

  const reference = String(data?.reference || '');
  if (!reference) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createSupabaseAdminClient();

  if (event === 'charge.success') {
    const { error } = await supabase
      .from('payments')
      .update({ status: 'succeeded' })
      .eq('id', reference);
    if (error) {
      console.error('Paystack webhook update error', error);
      return NextResponse.json({ error: 'Unable to update payment' }, { status: 500 });
    }
  }

  if (event === 'charge.failed') {
    const { error } = await supabase
      .from('payments')
      .update({ status: 'failed' })
      .eq('id', reference);
    if (error) {
      console.error('Paystack webhook update error', error);
      return NextResponse.json({ error: 'Unable to update payment' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
