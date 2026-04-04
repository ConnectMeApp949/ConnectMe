import { isAuthenticated } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import AdminShell from '@/components/AdminShell';
import LoginForm from '@/components/LoginForm';

async function getRevenueData() {
  try {
    // TODO: Create a dedicated admin API endpoint for this
    // For now, aggregate from available endpoints
    const [vendorsRes, bookingsRes] = await Promise.all([
      apiFetch<any>('/vendors/search?page=1'),
      apiFetch<any>('/bookings'),
    ]);

    const vendors = vendorsRes?.data ?? [];
    const bookings = bookingsRes?.data ?? [];

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthBookings = bookings.filter((b: any) =>
      new Date(b.createdAt) >= startOfMonth && b.status !== 'CANCELLED'
    );

    const totalTransactionFees = thisMonthBookings.reduce(
      (sum: number, b: any) => sum + Number(b.platformRevenue ?? 0), 0
    );
    const totalPayouts = thisMonthBookings.reduce(
      (sum: number, b: any) => sum + (Number(b.totalAmount ?? 0) - Number(b.vendorFee ?? 0)), 0
    );

    const tierCounts = { SPARK: 0, IGNITE: 0, AMPLIFY: 0 };
    vendors.forEach((v: any) => {
      const tier = v.subscriptionTier as keyof typeof tierCounts;
      if (tier in tierCounts) tierCounts[tier]++;
    });

    const mrr = tierCounts.IGNITE * 49 + tierCounts.AMPLIFY * 99;

    return {
      mrr,
      transactionFees: totalTransactionFees,
      vendorPayouts: totalPayouts,
      totalVendors: vendors.length,
      tierCounts,
      totalBookings: thisMonthBookings.length,
    };
  } catch {
    return { mrr: 0, transactionFees: 0, vendorPayouts: 0, totalVendors: 0, tierCounts: { SPARK: 0, IGNITE: 0, AMPLIFY: 0 }, totalBookings: 0 };
  }
}

export default async function RevenuePage() {
  if (!(await isAuthenticated())) return <LoginForm />;

  const data = await getRevenueData();

  const stats = [
    { label: 'Monthly Recurring Revenue', value: `$${data.mrr.toLocaleString()}`, sub: 'From subscriptions', color: 'bg-blue-50 text-blue-700' },
    { label: 'Transaction Fees (This Month)', value: `$${data.transactionFees.toFixed(2)}`, sub: 'Platform revenue', color: 'bg-green-50 text-green-700' },
    { label: 'Vendor Payouts (This Month)', value: `$${data.vendorPayouts.toFixed(2)}`, sub: 'Paid to vendors', color: 'bg-purple-50 text-purple-700' },
    { label: 'Total Bookings (This Month)', value: String(data.totalBookings), sub: 'Active bookings', color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold mb-6">Platform Revenue</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-5 ${s.color}`}>
            <p className="text-sm font-medium opacity-70">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
            <p className="text-xs mt-1 opacity-60">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Subscription breakdown */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Subscription Tiers</h2>
        <div className="grid grid-cols-3 gap-4">
          {(['SPARK', 'IGNITE', 'AMPLIFY'] as const).map((tier) => (
            <div key={tier} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">{data.tierCounts[tier]}</p>
              <p className="text-sm text-gray-500">{tier}</p>
              <p className="text-xs text-gray-400">
                {tier === 'SPARK' ? 'Free' : tier === 'IGNITE' ? '$49/mo' : '$99/mo'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
