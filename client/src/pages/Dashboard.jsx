import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import API from '../services/api';
import { formatBytes, formatDate, getStatusBadgeClass, formatStatusText } from '../utils/formatters';
import SecuritySummaryCard from '../components/SecuritySummaryCard';
import SecureShareModal from '../components/SecureShareModal';
import { 
  FolderLock, 
  Share2, 
  CheckCircle2, 
  Download, 
  HardDrive, 
  Plus, 
  Clock, 
  ArrowUpRight, 
  FileText,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { openUploadModal } = useOutletContext() || {};
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [recentShares, setRecentShares] = useState([]);
  const [loading, setLoading] = useState(true);

  // Share modal state
  const [shareModalFile, setShareModalFile] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const res = await API.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.data.stats);
        setRecentActivity(res.data.data.recentActivity || []);
        setRecentFiles(res.data.data.recentFiles || []);
        setRecentShares(res.data.data.recentShares || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const MAX_STORAGE = 100 * 1024 * 1024 * 1024; // 100 GB limit demo
  const storagePercentage = stats ? Math.min(100, Math.round((stats.storageUsed / (5 * 1024 * 1024 * 1024)) * 100)) : 0;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-500">Loading Secure Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Security Dashboard</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Overview of stored files, active policies, download history & storage consumption.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openUploadModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Files</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FolderLock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900">{stats?.totalFiles || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shared Files</span>
            <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
              <Share2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900">{stats?.totalShares || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Shares</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900">{stats?.activeShares || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Downloads</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Download className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900">{stats?.totalDownloads || 0}</p>
        </div>

        <div className="col-span-2 md:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Storage Used</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900">{formatBytes(stats?.storageUsed || 0)}</p>
          <div className="space-y-1 pt-1">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(5, storagePercentage)}%` }} 
              />
            </div>
            <p className="text-[10px] text-slate-400 text-right">5 GB Quota</p>
          </div>
        </div>
      </div>

      {/* Security Status Card */}
      <SecuritySummaryCard />

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recently Uploaded Files & Active Shares */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recently Uploaded Files */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Recently Uploaded Files</h3>
              <Link to="/files" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {recentFiles.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No files uploaded yet.</p>
                <button
                  onClick={openUploadModal}
                  className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Upload your first file
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentFiles.map((file) => (
                  <div key={file._id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition">
                    <div className="flex items-center gap-3 truncate">
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-slate-800 truncate">{file.fileName}</p>
                        <p className="text-[11px] text-slate-400">{formatBytes(file.fileSize)} • {formatDate(file.createdAt)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShareModalFile(file)}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Shared Files */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Recently Shared Links</h3>
              <Link to="/shared" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <span>Manage Shares</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {recentShares.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Share2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No active shared links.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentShares.map((share) => (
                  <div key={share._id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800 truncate max-w-[220px]">
                        {share.fileId?.fileName || 'Shared Document'}
                      </p>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase ${getStatusBadgeClass(share.status)}`}>
                        {formatStatusText(share.status)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60 gap-2">
                      <span>Shared with: <strong className="text-slate-700">{share.authorizedEmails?.length || 0} user(s)</strong></span>
                      <span>Expires: <strong className="text-slate-700">{formatDate(share.expiresAt)}</strong></span>
                      <span>Downloads: <strong className="text-slate-700">{share.downloadCount} {share.downloadLimit ? `/ ${share.downloadLimit}` : ''}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Audit Activity Feed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Recent Audit Trail</h3>
            <Link to="/activity" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              Full Log
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex-1 flex flex-col items-center justify-center">
              <Clock className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs text-slate-500">No activity logged yet.</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {recentActivity.map((act) => (
                <div key={act._id} className="flex gap-3 text-xs border-b border-slate-100 pb-3 last:border-none">
                  <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg h-fit shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 leading-snug">
                      {act.action === 'file_uploaded' && `Uploaded ${act.metadata?.fileName || 'a file'}`}
                      {act.action === 'file_shared' && `Shared ${act.metadata?.fileName} with ${act.metadata?.recipientEmail}`}
                      {act.action === 'file_downloaded' && `${act.metadata?.downloadedBy} downloaded ${act.metadata?.fileName}`}
                      {act.action === 'share_revoked' && `Revoked access to ${act.metadata?.fileName}`}
                      {act.action === 'share_created' && `Created share link for ${act.metadata?.fileName}`}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{formatDate(act.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {shareModalFile && (
        <SecureShareModal
          file={shareModalFile}
          onClose={() => setShareModalFile(null)}
          onSuccess={() => fetchDashboardData()}
        />
      )}
    </div>
  );
};

export default Dashboard;
