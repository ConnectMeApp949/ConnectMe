const API_KEY = process.env.EXPO_PUBLIC_API_KEY || '';

/**
 * Returns standard headers for API requests.
 * Includes the API key and optional auth token.
 */
export function apiHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}
