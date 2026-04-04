import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const COOKIE_NAME = 'admin_session';

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === 'authenticated';
}

export function validatePassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}
