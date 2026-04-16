const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || '';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: { page: number; perPage: number; total: number; totalPages: number };
  error?: {
    code: string;
    message: string;
    errors?: { field: string; message: string }[];
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
      ...options.headers,
    },
    ...options,
  });
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────

export async function register(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  userType: 'VENDOR' | 'CLIENT';
}) {
  return request<{ user: any; accessToken: string; refreshToken: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function login(email: string, password: string) {
  return request<{ user: any; accessToken: string; refreshToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ─── Vendors ─────────────────────────────────────────────

export interface VendorSearchParams {
  category?: string;
  city?: string;
  date?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  page?: number;
}

export async function searchVendors(params: VendorSearchParams = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') query.set(k, String(v));
  });
  return request<any[]>(`/vendors/search?${query.toString()}`);
}

export async function getVendor(vendorId: string) {
  return request<any>(`/vendors/${vendorId}`);
}
