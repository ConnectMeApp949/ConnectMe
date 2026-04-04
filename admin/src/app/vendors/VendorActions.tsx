'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function VendorActions({
  vendorId,
  isActive,
  userId,
}: {
  vendorId: string;
  isActive: boolean;
  userId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState('');

  async function handleVerify() {
    setLoading('verify');
    try {
      // TODO: Create admin-specific API endpoint
      await fetch(`${API_URL}/admin/vendors/${userId}/verify`, { method: 'POST' });
      router.refresh();
    } catch { /* handle */ }
    finally { setLoading(''); }
  }

  async function handleToggleActive() {
    setLoading('toggle');
    try {
      // TODO: Create admin-specific API endpoint
      await fetch(`${API_URL}/admin/vendors/${vendorId}/toggle-active`, { method: 'POST' });
      router.refresh();
    } catch { /* handle */ }
    finally { setLoading(''); }
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={handleVerify}
        disabled={loading === 'verify'}
        className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50"
      >
        {loading === 'verify' ? '...' : '✓ Verify'}
      </button>
      <button
        onClick={handleToggleActive}
        disabled={loading === 'toggle'}
        className={`px-2 py-1 text-xs rounded disabled:opacity-50 ${
          isActive
            ? 'bg-red-50 text-red-700 hover:bg-red-100'
            : 'bg-green-50 text-green-700 hover:bg-green-100'
        }`}
      >
        {loading === 'toggle' ? '...' : isActive ? 'Deactivate' : 'Activate'}
      </button>
    </div>
  );
}
