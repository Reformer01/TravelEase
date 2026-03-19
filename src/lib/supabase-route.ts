import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');

  const url = raw.trim();
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  if (url.includes('YOUR-PROJECT-REF')) throw new Error('NEXT_PUBLIC_SUPABASE_URL is a placeholder value');

  try {
    new URL(url);
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
  }

  return url;
}

function getSupabaseAnonKey(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!raw) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');

  const key = raw.trim();
  if (!key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (key.includes('YOUR_SUPABASE_ANON_KEY')) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is a placeholder value');

  return key;
}

export function createSupabaseRouteClient(accessToken?: string): SupabaseClient {
  const globalHeaders: Record<string, string> = {};
  if (accessToken) {
    globalHeaders.Authorization = `Bearer ${accessToken}`;
  }

  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    global: {
      headers: globalHeaders,
    },
  });
}

export function createSupabaseAdminClient(): SupabaseClient {
  const candidates = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SERVICE_KEY,
    process.env.SUPABASE_SERVICE_ROLE,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
  ].filter((v): v is string => typeof v === 'string' && v.trim().length > 0);

  const envServiceRoleKey = candidates[0];
  if (!envServiceRoleKey) {
    throw new Error(
      'Missing Supabase service role key. Set SUPABASE_SERVICE_ROLE_KEY (recommended) in Vercel/ENV. Also accepted: SUPABASE_SERVICE_KEY, SUPABASE_SERVICE_ROLE.'
    );
  }

  const trimmed = envServiceRoleKey.trim();
  if (trimmed === 'your-service-role-key-here' || trimmed.includes('YOUR_SUPABASE_SERVICE_ROLE_KEY')) {
    throw new Error('Supabase service role key appears to be a placeholder value.');
  }

  return createClient(getSupabaseUrl(), trimmed);
}

export function getAccessTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}
