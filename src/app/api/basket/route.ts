import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseUser } from '@/lib/supabase-auth';
import { createSupabaseRouteClient } from '@/lib/supabase-route';

type BasketRow = {
  id: string;
  snapshot: any;
};

async function readBasket(supabase: ReturnType<typeof createSupabaseRouteClient>, userId: string) {
  const { data, error } = await supabase
    .from('basket_items')
    .select('id,snapshot')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const rows = (data || []) as BasketRow[];
  return rows.map((row) => ({ ...row.snapshot, basketId: row.id }));
}

export async function GET(request: NextRequest) {
  const { user, accessToken, error } = await requireSupabaseUser(request);
  if (!user) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;

  try {
    const supabase = createSupabaseRouteClient(accessToken || undefined);
    const items = await readBasket(supabase, userId);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('GET /api/basket error', error);
    return NextResponse.json({ error: 'Unable to fetch basket' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, accessToken, error } = await requireSupabaseUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { item } = body;
    if (!item) {
      return NextResponse.json({ error: 'Missing item in request body' }, { status: 400 });
    }

    const userId = user.id;
    const supabase = createSupabaseRouteClient(accessToken || undefined);

    const snapshot = { ...item };
    delete (snapshot as any).basketId;

    const { error: insErr } = await supabase.from('basket_items').insert({
      user_id: userId,
      snapshot,
    });
    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    const items = await readBasket(supabase, userId);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('POST /api/basket error', error);
    return NextResponse.json({ error: 'Unable to add item to basket' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, accessToken, error } = await requireSupabaseUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const basketId = url.searchParams.get('basketId');
    const clearOnly = url.searchParams.get('clear');

    const userId = user.id;

    const supabase = createSupabaseRouteClient(accessToken || undefined);

    if (clearOnly === '1') {
      const { error: delErr } = await supabase.from('basket_items').delete().eq('user_id', userId);
      if (delErr) {
        return NextResponse.json({ error: delErr.message }, { status: 500 });
      }
      return NextResponse.json({ items: [] });
    }

    if (!basketId) {
      return NextResponse.json({ error: 'Missing basketId query param' }, { status: 400 });
    }

    const { error: delOneErr } = await supabase
      .from('basket_items')
      .delete()
      .eq('user_id', userId)
      .eq('id', basketId);
    if (delOneErr) {
      return NextResponse.json({ error: delOneErr.message }, { status: 500 });
    }

    const items = await readBasket(supabase, userId);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('DELETE /api/basket error', error);
    return NextResponse.json({ error: 'Unable to delete basket item' }, { status: 500 });
  }
}
