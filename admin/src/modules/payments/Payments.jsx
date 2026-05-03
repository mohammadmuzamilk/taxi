import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api/adminApi';
import { 
  CreditCard, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft,
  Search,
  Download
} from 'lucide-react';

const Payments = () => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, recentRes] = await Promise.all([
        adminApi.getPaymentStats(),
        adminApi.getRecentPayments()
      ]);
      setStats(statsRes.data.data);
      setRecent(recentRes.data.data);
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // eslint-disable-line
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Processing financial data...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Revenue & Payouts</h1>
        <button className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-500 transition-colors shadow-sm">
          <Download size={18} />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-linear-to-br from-slate-900 to-black p-6 rounded-3xl text-white shadow-lg relative overflow-hidden group">
           <div className="absolute -right-8 -top-8 w-32 h-32 bg-white opacity-10 rounded-full group-hover:scale-125 transition-transform"></div>
           <CreditCard size={24} className="mb-4 opacity-80" />
           <p className="text-slate-400 text-sm font-medium mb-1">Total Revenue</p>
           <h3 className="text-3xl font-black">₹{stats?.totalRevenue || 0}</h3>
           <div className="flex items-center gap-1 mt-4 text-xs font-bold bg-yellow-400/20 text-yellow-400 w-fit px-2 py-1 rounded-full">
              <ArrowUpRight size={14} /> 12.4% Increase
           </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <Wallet size={24} className="mb-4 text-emerald-500" />
           <p className="text-slate-500 text-sm font-medium mb-1">Driver Payouts</p>
           <h3 className="text-3xl font-black text-slate-900">₹{stats?.driverEarnings || 0}</h3>
           <div className="flex items-center gap-1 mt-4 text-xs font-bold text-slate-400">
              Last payout: 2 hours ago
           </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <ArrowDownLeft size={24} className="mb-4 text-yellow-400" />
           <p className="text-slate-500 text-sm font-medium mb-1">Platform Margin</p>
           <h3 className="text-3xl font-black text-slate-900">₹{stats?.platformCommission || 0}</h3>
           <div className="flex items-center gap-1 mt-4 text-xs font-bold text-yellow-600">
              Avg. Commission: 18.5%
           </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
           <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search ID..." className="pl-9 pr-4 py-1.5 border border-slate-100 rounded-full text-xs outline-none focus:border-yellow-400 w-48" />
           </div>
        </div>
        <table className="w-full text-left">
           <thead>
              <tr className="bg-slate-50/50">
                 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-50">
              {recent.map(pay => (
                 <tr key={pay.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400 font-bold">{pay.id.split('-')[0].toUpperCase()}</td>
                    <td className="px-6 py-4">
                       <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-tighter">
                          {pay.paymentMethod}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900">₹{pay.amount}</td>
                    <td className="px-6 py-4">
                       <span className={`text-[10px] font-black uppercase tracking-widest ${
                          pay.status === 'SUCCESS' ? 'text-emerald-500' : 'text-rose-500'
                       }`}>
                          {pay.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{new Date(pay.createdAt).toLocaleDateString()}</td>
                 </tr>
              ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
