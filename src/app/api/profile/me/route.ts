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
    const { data, error: selErr } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();

    if (selErr) {
      console.error('Failed to load profile', selErr);
      return NextResponse.json({ error: 'Unable to load profile' }, { status: 500 });
    }

    // If row doesn't exist yet, return empty profile.
    return NextResponse.json({ ok: true, profile: data || null });
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
    const fullNameRaw = typeof body?.fullName === 'string' ? body.fullName : null;
    const firstNameRaw = typeof body?.firstName === 'string' ? body.firstName : null;
    const lastNameRaw = typeof body?.lastName === 'string' ? body.lastName : null;

    const normalizedFullName = fullNameRaw?.trim() || null;
    const fullNameParts = normalizedFullName ? normalizedFullName.split(/\s+/).filter(Boolean) : [];
    const derivedFirstName = fullNameParts.length > 0 ? fullNameParts[0] : null;
    const derivedLastName = fullNameParts.length > 1 ? fullNameParts.slice(1).join(' ') : null;

    const first_name = firstNameRaw?.trim() || derivedFirstName;
    const last_name = lastNameRaw?.trim() || derivedLastName;
    const phone_number = typeof body?.phoneNumber === 'string' ? body.phoneNumber : null;
    const email = typeof body?.email === 'string' ? body.email : user.email;
    const date_of_birth = typeof body?.dateOfBirth === 'string' ? body.dateOfBirth : null;
    const home_address = typeof body?.homeAddress === 'string' ? body.homeAddress : null;

    const supabase = createSupabaseRouteClient(accessToken);

    const payload = {
      user_id: user.id,
      first_name,
      last_name,
      phone_number,
      email,
      date_of_birth: date_of_birth || null,
      home_address: home_address || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error: upErr } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (upErr) {
      console.error('Failed to save profile', upErr);
      return NextResponse.json({ error: 'Unable to save profile' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, profile: data });
  } catch (e) {
    console.error('PUT /api/profile/me error', e);
    return NextResponse.json({ error: 'Unable to save profile' }, { status: 500 });
  }
}
