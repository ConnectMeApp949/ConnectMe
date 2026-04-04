import { isAuthenticated } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import AdminShell from '@/components/AdminShell';
import LoginForm from '@/components/LoginForm';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

async function getBookings() {
  try {
    const res = await apiFetch<any>('/bookings');
    return res?.data ?? [];
  } catch {
    return [];
  }
}

export default async function BookingsPage() {
  if (!(await isAuthenticated())) return <LoginForm />;

  const bookings = await getBookings();

  const totalRevenue = bookings.reduce(
    (sum: number, b: any) => sum + Number(b.platformRevenue ?? 0), 0
  );

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <div className="flex gap-4 text-sm">
          <span className="text-gray-500">{bookings.length} total</span>
          <span className="font-medium text-green-600">
            ${totalRevenue.toFixed(2)} platform revenue
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-left">
              <th className="px-4 py-3 font-medium text-gray-500">ID</th>
              <th className="px-4 py-3 font-medium text-gray-500">Event</th>
              <th className="px-4 py-3 font-medium text-gray-500">Client</th>
              <th className="px-4 py-3 font-medium text-gray-500">Vendor</th>
              <th className="px-4 py-3 font-medium text-gray-500">Date</th>
              <th className="px-4 py-3 font-medium text-gray-500">Total</th>
              <th className="px-4 py-3 font-medium text-gray-500">Platform Fee</th>
              <th className="px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 font-medium text-gray-500">Payment</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b: any) => (
              <tr key={b.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-400">
                  {b.id.slice(0, 8)}...
                </td>
                <td className="px-4 py-3 font-medium">{b.eventType}</td>
                <td className="px-4 py-3 text-gray-600">
                  {b.client?.firstName} {b.client?.lastName}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {b.vendor?.businessName ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(b.eventDate).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3 font-medium">
                  ${Number(b.totalAmount).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-green-600 font-medium">
                  ${Number(b.platformRevenue ?? 0).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[b.status] ?? ''}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {b.payment?.status ?? '—'}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">No bookings found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
