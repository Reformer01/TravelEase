import { DateString } from '@/types/dates';

export interface SessionResult {
  accessToken: string | null;
  error: string | null;
  isValid: boolean;
}

export async function validateAndRefreshSession(
  auth: { auth: { getSession(): Promise<{ data: { session: any } | null; error: any }> } }
): Promise<SessionResult> {
  try {
    const { data, error } = await auth.auth.getSession();
    
    if (error) {
      console.error('🔐 Session validation error:', error);
      return { accessToken: null, error: error.message, isValid: false };
    }
    
    if (!data?.session) {
      return { accessToken: null, error: 'No active session', isValid: false };
    }
    
    const accessToken = data.session.access_token;
    if (!accessToken) {
      return { accessToken: null, error: 'No access token in session', isValid: false };
    }
    
    // Check if token is expired (Supabase tokens have exp claim)
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < now) {
        return { accessToken: null, error: 'Session expired', isValid: false };
      }
    } catch (e) {
      console.error('🔐 Error parsing token:', e);
      return { accessToken: null, error: 'Invalid token format', isValid: false };
    }
    
    return { accessToken, error: null, isValid: true };
  } catch (error) {
    console.error('🔐 Session validation error:', error);
    return { accessToken: null, error: 'Session validation failed', isValid: false };
  }
}

// Cache validation result to prevent excessive calls
let validationCache: { result: SessionResult | null; timestamp: number } = {
  result: null,
  timestamp: 0
};

const CACHE_DURATION = 5000; // 5 seconds

export async function validateAndRefreshSessionCached(
  auth: { auth: { getSession(): Promise<{ data: { session: any } | null; error: any }> } }
): Promise<SessionResult> {
  const now = Date.now();
  
  // Return cached result if still valid
  if (validationCache.result && (now - validationCache.timestamp) < CACHE_DURATION) {
    console.log('🔐 Using cached session validation result');
    return validationCache.result;
  }
  
  console.log('🔐 Performing fresh session validation');
  // Validate and cache the result
  const result = await validateAndRefreshSession(auth);
  validationCache = { result, timestamp: now };
  
  return result;
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  getValidToken: () => Promise<string | null>,
  maxRetries: number = 1
): Promise<Response> {
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    const token = await getValidToken();
    
    if (!token) {
      console.log('🔐 No valid token available, stopping retries');
      throw new Error('No valid session token available');
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    
    // If we get a 401, stop retrying immediately and throw an error
    if (response.status === 401) {
      console.log('🔐 Got 401 Unauthorized, stopping retries');
      throw new Error('Session expired - 401 Unauthorized');
    }
    
    // If we get other errors and haven't exceeded retries, try again with a fresh token
    if (!response.ok && attempt < maxRetries) {
      attempt++;
      console.log(`🔐 Request failed with ${response.status}, retrying (${attempt}/${maxRetries})`);
      continue;
    }
    
    return response;
  }
  
  throw new Error(`Request failed after ${maxRetries} retries`);
}

export function handleSessionExpired(navigate: (path: string) => void, currentPath?: string) {
  // Don't redirect if already on login page to avoid loops
  if (currentPath?.includes('/auth/login')) {
    return;
  }
  
  // Clear any auth-related storage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('travelease_guest_basket_v1');
  }
  
  // Navigate to login with return URL
  const returnUrl = currentPath ? encodeURIComponent(currentPath) : '';
  navigate(`/auth/login${returnUrl ? '?returnUrl=' + returnUrl : ''}`);
}
