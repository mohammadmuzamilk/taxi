import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api/adminApi';
import { 
  User, 
  Ban, 
  CheckCircle,
  MoreVertical,
  Mail,
  Phone
} from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await adminApi.getUsers();
      setUsers(response.data.data);
    } catch (_ERR) {
      console.error('Failed to fetch users:', _ERR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(); // eslint-disable-line
  }, []);

  const handleToggleActive = async (userId, isActive) => {
    try {
      await adminApi.toggleUserActive(userId, isActive);
      fetchUsers();
    // eslint-disable-next-line no-unused-vars
    } catch (_ERR) {
      alert('Failed to update user status');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading customers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium">
          Total Customers: {users.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-yellow-400 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-700 group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                <User size={24} />
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleToggleActive(user.id, !user.isActive)}
                  className={`p-2 rounded-lg transition-colors ${
                    user.isActive ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'
                  }`}
                  title={user.isActive ? 'Block User' : 'Unblock User'}
                >
                  {user.isActive ? <Ban size={18} /> : <CheckCircle size={18} />}
                </button>
                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-slate-900 text-lg mb-1">{user.name || 'New Customer'}</h3>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${
              user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {user.isActive ? 'Active' : 'Blocked'}
            </span>

            <div className="space-y-2 pt-4 border-t border-slate-50">
               <div className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
                  <Phone size={14} />
                  <span className="text-sm font-medium">{user.phone}</span>
               </div>
               <div className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
                  <Mail size={14} />
                  <span className="text-sm font-medium">{user.email || 'No Email'}</span>
               </div>
            </div>
            
            <div className="mt-6 flex gap-2">
               <button className="flex-1 bg-slate-50 text-slate-700 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors border border-slate-100">
                  View Rides
               </button>
               <button className="flex-1 bg-slate-50 text-slate-700 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors border border-slate-100">
                  Edit Details
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
