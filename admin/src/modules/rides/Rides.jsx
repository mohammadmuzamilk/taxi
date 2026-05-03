import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api/adminApi';
import { 
  MapPin, 
  Clock, 
  Calendar,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';

const Rides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRides = async () => {
    try {
      const response = await adminApi.getRides();
      setRides(response.data.data);
    } catch (error) {
      console.error('Failed to fetch rides:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides(); // eslint-disable-line
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading rides history...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Ride History</h1>
        <div className="flex gap-2">
           <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-500 transition-colors shadow-sm">
             Live Map Tracking
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ride Details</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client & Driver</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rides.map((ride) => (
              <tr key={ride.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 shrink-0"></div>
                      <p className="text-sm font-medium text-slate-900 line-clamp-1">{ride.pickupAddress}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0"></div>
                      <p className="text-sm font-medium text-slate-900 line-clamp-1">{ride.dropAddress}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 font-semibold">
                       <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(ride.createdAt).toLocaleDateString()}</span>
                       <span className="flex items-center gap-1"><Clock size={12}/> {new Date(ride.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">{ride.clientName || 'Anonymous'}</p>
                    <p className="text-xs text-yellow-600 font-bold tracking-tight">DRIVER: {ride.driverName || 'Not Assigned'}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-black text-slate-900">₹{ride.fare || 0}</p>
                  <p className="text-xs text-slate-400 font-medium lowercase tracking-tighter">{ride.distance || '0 km'}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    ride.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    ride.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {ride.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Rides;
