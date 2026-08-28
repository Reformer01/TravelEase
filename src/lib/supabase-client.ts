import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

// NOTE: These must be accessed via static property access (process.env.NEXT_PUBLIC_*)
// so that Next.js can inline them into the client bundle at build time. Dynamic
// access (e.g. process.env[name]) cannot be statically replaced and will be
// undefined in the browser.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function assertValidUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('Invalid protocol');
    }
  } catch {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not a valid URL. Expected something like https://<project-ref>.supabase.co.'
    );
  }
  return url;
}

function assertNotPlaceholder(value: string, name: string): string {
  const placeholders = [
    'YOUR-PROJECT-REF',
    'YOUR_SUPABASE_ANON_KEY',
    'YOUR_SUPABASE_SERVICE_ROLE_KEY',
    'your-actual-project-ref',
    'your-actual-anon-key-here',
    'your-actual-service-role-key-here',
  ];
  if (placeholders.some((p) => value.includes(p))) {
    throw new Error(
      `Supabase env var ${name} appears to be a placeholder value. Update .env.local with real Supabase credentials from Project Settings -> API.`
    );
  }
  return value;
}

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase environment variables are not set. Supabase auth will not work without NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  const supabaseUrl = assertValidUrl(assertNotPlaceholder(SUPABASE_URL.trim(), 'NEXT_PUBLIC_SUPABASE_URL'));
  const supabaseAnonKey = assertNotPlaceholder(SUPABASE_ANON_KEY.trim(), 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}

// Backwards compatibility - lazy initialize on first access
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  }
});
