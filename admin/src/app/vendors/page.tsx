import { isAuthenticated } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import AdminShell from '@/components/AdminShell';
import LoginForm from '@/components/LoginForm';
import VendorActions from './VendorActions';

async function getVendors() {
  try {
    const res = await apiFetch<any>('/vendors/search?page=1');
    return res?.data ?? [];
  } catch {
    return [];
  }
}

export default async function VendorsPage() {
  if (!(await isAuthenticated())) return <LoginForm />;

  const vendors = await getVendors();

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <p className="text-sm text-gray-500">{vendors.length} total</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-left">
              <th className="px-4 py-3 font-medium text-gray-500">Business</th>
              <th className="px-4 py-3 font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 font-medium text-gray-500">Location</th>
              <th className="px-4 py-3 font-medium text-gray-500">Tier</th>
              <th className="px-4 py-3 font-medium text-gray-500">Bookings</th>
              <th className="px-4 py-3 font-medium text-gray-500">Rating</th>
              <th className="px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v: any) => (
              <tr key={v.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{v.businessName}</p>
                    <p className="text-xs text-gray-400">
                      {v.user?.firstName} {v.user?.lastName}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{v.category.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 text-gray-600">{v.city}, {v.state}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    v.subscriptionTier === 'AMPLIFY' ? 'bg-purple-100 text-purple-700'
                    : v.subscriptionTier === 'IGNITE' ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                  }`}>
                    {v.subscriptionTier}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{v.totalBookings}</td>
                <td className="px-4 py-3 text-gray-600">
                  {Number(v.averageRating) > 0 ? `★ ${Number(v.averageRating).toFixed(1)}` : '—'}
                </td>
                <td className="px-4 py-3">
                  {v.isActive ? (
                    <span className="text-green-600 text-xs font-medium">Active</span>
                  ) : (
                    <span className="text-red-600 text-xs font-medium">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <VendorActions vendorId={v.id} isActive={v.isActive} userId={v.user?.id} />
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">No vendors found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
