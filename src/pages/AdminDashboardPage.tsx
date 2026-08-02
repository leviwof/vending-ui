import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type SalesMetrics = {
  todaySalesCount: number;
  todayRevenueRupees: number;
  totalSalesCount: number;
  pendingRefundsCount: number;
  lowStockCount: number;
};

type PaymentRecord = {
  id: string;
  externalRef: string;
  method: string;
  amountCents: number;
  status: string;
  createdAt: string;
  transaction?: {
    item?: {
      name: string;
    };
  };
};

type ItemStock = {
  id: string;
  name: string;
  quantity: number;
};

export function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<SalesMetrics>({
    todaySalesCount: 0,
    todayRevenueRupees: 0,
    totalSalesCount: 0,
    pendingRefundsCount: 0,
    lowStockCount: 0,
  });

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [items, setItems] = useState<ItemStock[]>([]);
  const [selectedRestockId, setSelectedRestockId] = useState<string>('');
  const [restockQty, setRestockQty] = useState<number>(10);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesRes, paymentsRes, itemsRes] = await Promise.all([
        api.get('/sales'),
        api.get('/payments'),
        api.get('/items'),
      ]);

      setMetrics(salesRes.data);
      setPayments(paymentsRes.data);
      setItems(
        itemsRes.data.map((i: any) => ({
          id: i.id,
          name: i.name,
          quantity: i.inventory?.quantity ?? 0,
        })),
      );
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestockId) return;

    try {
      await api.post(`/items/${selectedRestockId}/restock`, {
        quantity: restockQty,
        reason: 'Admin Manual Restock',
      });
      setIsRestockOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Failed to restock item');
    }
  };

  const handleExportCSV = () => {
    if (payments.length === 0) {
      alert('No payment records to export.');
      return;
    }

    const headers = ['Payment ID,External Ref,Item,Amount (INR),Method,Status,Timestamp'];
    const rows = payments.map((p) => [
      p.id,
      p.externalRef,
      `"${p.transaction?.item?.name || 'N/A'}"`,
      (p.amountCents / 100).toFixed(2),
      p.method,
      p.status,
      new Date(p.createdAt).toISOString(),
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vending_payments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-mist pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.35em] text-ink/40">Fleet command</div>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-ink">Vending Operations Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRestockOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
          >
            <span>📦</span> Restock Machine
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-2xl border border-mist bg-white px-5 py-3 font-bold text-ink hover:bg-mist transition-all"
          >
            <span>📊</span> Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink/50">Today's Revenue</div>
          <div className="mt-3 font-display text-3xl font-extrabold text-emerald-600">
            ₹{metrics.todayRevenueRupees}
          </div>
          <div className="mt-1 text-xs text-ink/50">{metrics.todaySalesCount} dispenses today</div>
        </article>

        <article className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink/50">Total Lifetime Sales</div>
          <div className="mt-3 font-display text-3xl font-extrabold text-ink">
            {metrics.totalSalesCount} Units
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-semibold">100% Vend Accuracy</div>
        </article>

        <article className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink/50">Pending Refunds</div>
          <div className="mt-3 font-display text-3xl font-extrabold text-amber-600">
            {metrics.pendingRefundsCount}
          </div>
          <div className="mt-1 text-xs text-ink/50">Session timeout auto-refunds</div>
        </article>

        <article className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink/50">Low Stock Alerts</div>
          <div
            className={`mt-3 font-display text-3xl font-extrabold ${
              metrics.lowStockCount > 0 ? 'text-rose-500' : 'text-emerald-600'
            }`}
          >
            {metrics.lowStockCount} Items
          </div>
          <div className="mt-1 text-xs text-ink/50">Below 3 unit threshold</div>
        </article>
      </section>

      {/* Main Tables */}
      <section className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Payments History */}
        <article className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-mist pb-4">
            <h2 className="font-display text-2xl font-bold text-ink">Recent Transactions</h2>
            <button onClick={fetchData} className="text-xs font-bold text-indigo-600 hover:underline">
              🔄 Refresh
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            {loading ? (
              <div className="py-8 text-center text-sm text-ink/50">Loading transactions...</div>
            ) : payments.length === 0 ? (
              <div className="py-8 text-center text-sm text-ink/50">No transactions recorded yet.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-mist text-ink/40 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-2">Ref</th>
                    <th className="py-3 px-2">Item</th>
                    <th className="py-3 px-2">Amount</th>
                    <th className="py-3 px-2">Method</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mist/60">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-mist/30">
                      <td className="py-3 px-2 font-mono font-medium text-ink/70">{p.externalRef}</td>
                      <td className="py-3 px-2 font-bold text-ink">{p.transaction?.item?.name || 'N/A'}</td>
                      <td className="py-3 px-2 font-bold text-emerald-600">₹{(p.amountCents / 100).toFixed(0)}</td>
                      <td className="py-3 px-2">
                        <span className="rounded-md bg-mist px-2 py-0.5 font-bold text-ink/70">
                          {p.method}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-bold text-[10px] uppercase ${
                            p.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </article>

        {/* Inventory Stock Pressure */}
        <article className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-mist pb-4">
            <h2 className="font-display text-2xl font-bold text-ink">Inventory Stock</h2>
            <span className="text-xs font-semibold text-ink/50">{items.length} Products</span>
          </div>

          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl bg-mist/60 p-4 transition-colors hover:bg-mist"
              >
                <div>
                  <div className="font-bold text-ink">{item.name}</div>
                  <div className="text-xs text-ink/50">ID: {item.id.slice(0, 8)}...</div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-display text-lg font-extrabold ${
                      item.quantity <= 3 ? 'text-rose-500' : 'text-emerald-600'
                    }`}
                  >
                    {item.quantity} Units
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRestockId(item.id);
                      setIsRestockOpen(true);
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:underline"
                  >
                    + Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Restock Modal */}
      {isRestockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsRestockOpen(false)} className="fixed inset-0 bg-ink/70 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <h3 className="font-display text-2xl font-bold text-ink">Restock Product Inventory</h3>
            <form onSubmit={handleRestockSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-ink/50">Select Item</label>
                <select
                  value={selectedRestockId}
                  onChange={(e) => setSelectedRestockId(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-mist bg-white p-3 font-medium text-ink"
                  required
                >
                  <option value="">-- Choose Product --</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Current Qty: {i.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-ink/50">Restock Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="mt-1 w-full rounded-2xl border border-mist bg-white p-3 font-medium text-ink"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsRestockOpen(false)}
                  className="flex-1 rounded-2xl border border-mist py-3 font-bold text-ink/60 hover:bg-mist"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-emerald-600 py-3 font-bold text-white shadow-lg hover:bg-emerald-700"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
