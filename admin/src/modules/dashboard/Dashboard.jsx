import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api/adminApi';
import { 
  Users, 
  Car, 
  MapPin, 
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const StatCard = ({ title, value, icon, trend, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        {icon}
      </div>
      {trend && (
        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
          trend > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
        }`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await adminApi.getSummary();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(); // eslint-disable-line
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>)}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Dashboard</h1>
          <p className="text-slate-500">Real-time overview of your taxi network</p>
        </div>
        <button 
          onClick={fetchStats}
          className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <Clock size={16} />
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
          icon={<Users size={24} />} 
          trend={12}
          color="bg-yellow-400"
        />
        <StatCard 
          title="Active Drivers" 
          value={stats?.totalDrivers || 0} 
          icon={<Car size={24} />} 
          trend={8}
          color="bg-emerald-500"
        />
        <StatCard 
          title="Ongoing Rides" 
          value={stats?.activeRides || 0} 
          icon={<MapPin size={24} />} 
          color="bg-orange-500"
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats?.totalRevenue || 0}`} 
          icon={<TrendingUp size={24} />} 
          trend={15}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Network Health</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Active Requests</span>
              <span className="font-bold text-slate-900">12</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-yellow-400 h-full w-[65%] rounded-full"></div>
            </div>
            {/* More health indicators... */}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Alerts</h2>
          <div className="space-y-4">
             <div className="flex gap-4 p-3 bg-rose-50 rounded-xl border border-rose-100">
                <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 shrink-0"></div>
                <div>
                  <p className="text-sm font-semibold text-rose-900">Driver Account Suspension</p>
                  <p className="text-xs text-rose-600">Driver Rahul (ID: #D82) reported for misconduct.</p>
                </div>
             </div>
             {/* More alerts... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
