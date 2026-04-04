import { isAuthenticated } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import AdminShell from '@/components/AdminShell';
import LoginForm from '@/components/LoginForm';
import VerificationActions from './VerificationActions';

async function getPendingVerifications() {
  try {
    const res = await apiFetch<any>('/verification/pending');
    return res?.data ?? [];
  } catch {
    return [];
  }
}

export default async function VerificationsPage() {
  if (!(await isAuthenticated())) return <LoginForm />;

  const verifications = await getPendingVerifications();

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Vendor Verifications</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          verifications.length > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
        }`}>
          {verifications.length} pending
        </span>
      </div>

      {verifications.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-gray-500">All verifications have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {verifications.map((v: any) => (
            <div key={v.id} className="bg-white rounded-xl border p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{v.businessName}</h3>
                  <p className="text-sm text-gray-500">
                    {v.vendor?.user?.firstName} {v.vendor?.user?.lastName} · {v.vendor?.user?.email}
                  </p>
                  <p className="text-sm text-gray-400">
                    {v.vendor?.category?.replace(/_/g, ' ')} · {v.vendor?.city}, {v.vendor?.state}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  Submitted {new Date(v.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* ID preview */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1 uppercase">Government ID</p>
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <a
                      href={`${process.env.API_URL || 'http://localhost:3000'}${v.governmentIdUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      📄 View uploaded ID
                    </a>
                  </div>
                </div>

                {/* Business details */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1 uppercase">Business Details</p>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    <p><span className="text-gray-400">Name:</span> {v.businessName}</p>
                    {v.businessLicenseNumber && (
                      <p className="mt-1"><span className="text-gray-400">License:</span> {v.businessLicenseNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <VerificationActions verificationId={v.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
