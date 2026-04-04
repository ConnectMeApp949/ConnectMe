const API_URL = process.env.API_URL || 'http://localhost:3000';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    cache: 'no-store',
    ...options,
  });
  const data = await res.json();
  return data;
}
