import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseUser } from '@/lib/supabase-auth';
import { createSupabaseRouteClient } from '@/lib/supabase-route';

export async function GET(request: NextRequest) {
  const { user, accessToken, error } = await requireSupabaseUser(request);
  if (!user || !accessToken) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createSupabaseRouteClient(accessToken);
    const { data, error: selErr } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();

    if (selErr) {
      // If row doesn't exist yet, return empty profile.
      return NextResponse.json({ ok: true, profile: null });
    }

    return NextResponse.json({ ok: true, profile: data });
  } catch (e) {
    console.error('GET /api/profile/me error', e);
    return NextResponse.json({ error: 'Unable to load profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { user, accessToken, error } = await requireSupabaseUser(request);
  if (!user || !accessToken) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const first_name = typeof body?.firstName === 'string' ? body.firstName : null;
    const last_name = typeof body?.lastName === 'string' ? body.lastName : null;
    const phone_number = typeof body?.phoneNumber === 'string' ? body.phoneNumber : null;
    const email = typeof body?.email === 'string' ? body.email : user.email;

    const supabase = createSupabaseRouteClient(accessToken);

    const payload = {
      user_id: user.id,
      first_name,
      last_name,
      phone_number,
      email,
      updated_at: new Date().toISOString(),
    };

    const { data, error: upErr } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, profile: data });
  } catch (e) {
    console.error('PUT /api/profile/me error', e);
    return NextResponse.json({ error: 'Unable to save profile' }, { status: 500 });
  }
}
