import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 ml-64">
      <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-full w-96 border border-slate-200 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/20 transition-all">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search everything..." 
          className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-900 placeholder-slate-400 outline-none"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-yellow-500 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">Admin User</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Super Admin</p>
          </div>
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold shadow-sm">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
