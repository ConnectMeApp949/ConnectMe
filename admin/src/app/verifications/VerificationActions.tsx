'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function VerificationActions({ verificationId }: { verificationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');

  async function handleApprove() {
    setLoading('approve');
    try {
      await fetch(`${API_URL}/verification/${verificationId}/approve`, { method: 'POST' });
      router.refresh();
    } catch { /* handle */ }
    finally { setLoading(''); }
  }

  async function handleReject() {
    if (!reason.trim()) return;
    setLoading('reject');
    try {
      await fetch(`${API_URL}/verification/${verificationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      router.refresh();
    } catch { /* handle */ }
    finally { setLoading(''); setShowReject(false); }
  }

  if (showReject) {
    return (
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Rejection reason..."
          className="px-2 py-1 text-xs border rounded w-48"
          autoFocus
        />
        <button
          onClick={handleReject}
          disabled={loading === 'reject' || !reason.trim()}
          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading === 'reject' ? '...' : 'Confirm'}
        </button>
        <button onClick={() => setShowReject(false)} className="px-2 py-1 text-xs text-gray-500">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={handleApprove}
        disabled={loading === 'approve'}
        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading === 'approve' ? '...' : '✓ Approve'}
      </button>
      <button
        onClick={() => setShowReject(true)}
        className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100"
      >
        ✗ Reject
      </button>
    </div>
  );
}
