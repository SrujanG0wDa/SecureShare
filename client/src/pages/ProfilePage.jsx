import React from 'react';
import { useAuth } from '../context/AuthContext';
import { formatBytes } from '../utils/formatters';
import SecuritySummaryCard from '../components/SecuritySummaryCard';
import { User, Mail, Shield, HardDrive, Key, CheckCircle2 } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();

  const MAX_STORAGE = 5 * 1024 * 1024 * 1024; // 5 GB
  const storageUsed = user?.storageUsed || 0;
  const storagePercentage = Math.min(100, Math.round((storageUsed / MAX_STORAGE) * 100));

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Security & Account Profile</h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Review your account identity, security credentials, and storage consumption.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name || 'User'}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
              VERIFIED ACCOUNT
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Full Name</span>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>{user?.name}</span>
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Email Address</span>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              <span>{user?.email}</span>
            </p>
          </div>
        </div>

        {/* Storage usage */}
        <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-semibold text-slate-800">Storage Usage</span>
            </div>
            <span className="text-xs font-bold text-slate-700">{formatBytes(storageUsed)} / 5 GB ({storagePercentage}%)</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.max(3, storagePercentage)}%` }} 
            />
          </div>
        </div>
      </div>

      <SecuritySummaryCard />
    </div>
  );
};

export default ProfilePage;
