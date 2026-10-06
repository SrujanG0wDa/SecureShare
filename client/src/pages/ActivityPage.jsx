import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { formatDate } from '../utils/formatters';
import { 
  Activity as ActivityIcon, 
  Clock, 
  Upload, 
  Share2, 
  Download, 
  Ban, 
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const res = await API.get('/activity?limit=50');
      if (res.data.success) {
        setActivities(res.data.data.activities);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load audit activity log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getActionBadge = (action) => {
    switch (action) {
      case 'file_uploaded':
        return { label: 'Uploaded', icon: Upload, color: 'bg-emerald-100 text-emerald-800' };
      case 'file_shared':
      case 'share_created':
        return { label: 'Shared', icon: Share2, color: 'bg-blue-100 text-blue-800' };
      case 'file_downloaded':
        return { label: 'Downloaded', icon: Download, color: 'bg-[#edf3f8] text-[#094263]' };
      case 'share_revoked':
        return { label: 'Revoked', icon: Ban, color: 'bg-rose-100 text-rose-800' };
      default:
        return { label: 'Event', icon: ActivityIcon, color: 'bg-slate-100 text-slate-800' };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-[#094263] tracking-tight">System Audit & Activity Trail</h1>
        <p className="text-xs text-slate-500 font-medium">Complete timestamped activity history for all security events.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-[#094263] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">Loading audit trail...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 bg-[#edf3f8] rounded-xl border border-dashed border-slate-200 space-y-2">
            <Clock className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-[#094263] text-base">No audit events recorded yet</h3>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 ml-4 space-y-6 py-2">
            {activities.map((act) => {
              const badge = getActionBadge(act.action);
              const Icon = badge.icon;
              return (
                <div key={act._id} className="relative pl-6">
                  <div className={`absolute -left-[17px] top-0 p-1.5 rounded-full border-2 border-white shadow-sm ${badge.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="bg-[#edf3f8] rounded-2xl p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`px-3 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatDate(act.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-[#094263]">
                      {act.action === 'file_uploaded' && `Uploaded file "${act.metadata?.fileName || 'document'}"`}
                      {act.action === 'file_shared' && `Shared "${act.metadata?.fileName}" with ${act.metadata?.recipientEmail}`}
                      {act.action === 'share_created' && `Created access policy for "${act.metadata?.fileName}"`}
                      {act.action === 'file_downloaded' && `${act.metadata?.downloadedBy} downloaded "${act.metadata?.fileName}"`}
                      {act.action === 'share_revoked' && `Revoked share link for "${act.metadata?.fileName}"`}
                      {act.action === 'file_deleted' && `Deleted file "${act.metadata?.fileName}"`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
