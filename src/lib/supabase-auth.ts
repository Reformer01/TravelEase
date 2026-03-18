import { createSupabaseRouteClient, getAccessTokenFromRequest } from '@/lib/supabase-route';

export async function requireSupabaseUser(request: Request) {
  const accessToken = getAccessTokenFromRequest(request);
  if (!accessToken) {
    return { user: null, accessToken: null, error: 'Missing Authorization header' } as const;
  }

  const supabase = createSupabaseRouteClient(accessToken);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { user: null, accessToken: null, error: error?.message || 'Invalid session' } as const;
  }

  return { user: data.user, accessToken, error: null } as const;
}
