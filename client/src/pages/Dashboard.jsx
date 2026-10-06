import React, { useState, useEffect } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { formatBytes, formatDate } from '../utils/formatters';
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
  ChevronRight, 
  ShieldCheck,
  TrendingUp,
  User,
  Link as LinkIcon,
  ExternalLink,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { openUploadModal } = useOutletContext() || {};
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [recentShares, setRecentShares] = useState([]);
  const [loading, setLoading] = useState(true);

  // Share modal state
  const [shareModalFile, setShareModalFile] = useState(null);

  // Direct Access Link Feature state
  const [directShareLink, setDirectShareLink] = useState('');
  const [linkError, setLinkError] = useState('');

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

  const handleAccessSharedFile = (e) => {
    if (e) e.preventDefault();
    setLinkError('');

    const rawInput = directShareLink.trim();

    if (!rawInput) {
      setLinkError('Please paste a SecureShare access link.');
      return;
    }

    let extractedToken = '';

    // Validate if it is a full URL or direct share path or token
    if (rawInput.includes('/share/')) {
      // Check if it's a URL
      try {
        if (rawInput.startsWith('http://') || rawInput.startsWith('https://')) {
          const urlObj = new URL(rawInput);
          // Security check: ensure path starts with /share/
          if (!urlObj.pathname.includes('/share/')) {
            setLinkError('Only valid SecureShare sharing URLs are allowed.');
            return;
          }
        }
      } catch (err) {
        setLinkError('Invalid URL format. Please enter a valid SecureShare link.');
        return;
      }

      const parts = rawInput.split('/share/');
      const tokenPart = parts[1]?.split('?')[0]?.split('#')[0];
      extractedToken = (tokenPart || '').replace(/[^a-f0-9]/gi, '');
    } else if (/^[a-f0-9]{32,64}$/i.test(rawInput)) {
      // Direct hex token paste
      extractedToken = rawInput;
    }

    if (!extractedToken) {
      setLinkError('Could not extract a valid share token. Check the link format.');
      return;
    }

    // Navigate to public share access page
    toast.success('Accessing shared file...');
    navigate(`/share/${extractedToken}`);
  };

  const MAX_STORAGE = 5 * 1024 * 1024 * 1024; // 5 GB limit demo
  const storagePercentage = stats ? Math.min(100, Math.round((stats.storageUsed / MAX_STORAGE) * 100)) : 0;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#094263] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#094263]">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Upload Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[#094263] tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-slate-500 font-medium">Controlled file system & access control status.</p>
        </div>
        <button
          onClick={openUploadModal}
          className="px-5 py-2.5 bg-[#094263] hover:bg-[#07324c] text-white text-xs font-bold rounded-full shadow-md transition flex items-center gap-2 tracking-wide uppercase self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>

      {/* NEW FEATURE: Access Shared File Prominent Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#edf3f8] text-[#094263] flex items-center justify-center font-bold shrink-0">
            <LinkIcon className="w-5 h-5 text-[#094263]" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#094263]">Access Shared File</h2>
            <p className="text-xs text-slate-500 font-medium">
              Paste a SecureShare access link to access a file shared with you.
            </p>
          </div>
        </div>

        {linkError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{linkError}</span>
          </div>
        )}

        <form onSubmit={handleAccessSharedFile} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={directShareLink}
              onChange={(e) => {
                setDirectShareLink(e.target.value);
                if (linkError) setLinkError('');
              }}
              placeholder="Paste secure access link here..."
              className="w-full px-5 py-3 bg-[#edf3f8] text-[#094263] placeholder-slate-400 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#094263] transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#094263] hover:bg-[#07324c] text-white text-xs font-bold rounded-full shadow-md transition flex items-center justify-center gap-2 shrink-0 uppercase tracking-wider"
          >
            <span>Access File</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Top Metric Cards Row (Floating Circle Badges) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-3">
        {/* Total Files Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative pt-7 transition hover:shadow-md">
          <div className="w-11 h-11 bg-[#094263] text-white rounded-full flex items-center justify-center absolute -top-4 left-6 shadow-md border-2 border-white">
            <FolderLock className="w-5 h-5" />
          </div>
          <div className="text-right space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Files</span>
            <p className="text-2xl md:text-3xl font-extrabold text-[#094263]">{stats?.totalFiles || 0}</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+100% Secure Storage</span>
          </div>
        </div>

        {/* Shared Files Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative pt-7 transition hover:shadow-md">
          <div className="w-11 h-11 bg-[#094263] text-white rounded-full flex items-center justify-center absolute -top-4 left-6 shadow-md border-2 border-white">
            <Share2 className="w-5 h-5" />
          </div>
          <div className="text-right space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Shared Links</span>
            <p className="text-2xl md:text-3xl font-extrabold text-[#094263]">{stats?.totalShares || 0}</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+ Active Policies</span>
          </div>
        </div>

        {/* Active Shares Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative pt-7 transition hover:shadow-md">
          <div className="w-11 h-11 bg-[#094263] text-white rounded-full flex items-center justify-center absolute -top-4 left-6 shadow-md border-2 border-white">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-right space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Shares</span>
            <p className="text-2xl md:text-3xl font-extrabold text-[#094263]">{stats?.activeShares || 0}</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Unexpired Links</span>
          </div>
        </div>

        {/* Downloads / Storage Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative pt-7 transition hover:shadow-md">
          <div className="w-11 h-11 bg-[#094263] text-white rounded-full flex items-center justify-center absolute -top-4 left-6 shadow-md border-2 border-white">
            <Download className="w-5 h-5" />
          </div>
          <div className="text-right space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Downloads</span>
            <p className="text-2xl md:text-3xl font-extrabold text-[#094263]">{stats?.totalDownloads || 0}</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>Storage: {formatBytes(stats?.storageUsed || 0)}</span>
            <span className="text-[#094263] font-bold">{storagePercentage}%</span>
          </div>
        </div>
      </div>

      {/* Middle Row Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Storage Health Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#edf3f8] text-[#094263] flex items-center justify-center font-bold">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#094263] text-sm">Storage Consumption</h3>
              <p className="text-[11px] text-slate-400">Quota usage breakdown</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-[#094263]">
              <span>Used: {formatBytes(stats?.storageUsed || 0)}</span>
              <span>Limit: 5 GB</span>
            </div>
            <div className="w-full bg-[#edf3f8] rounded-full h-2 overflow-hidden">
              <div 
                className="bg-[#094263] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(4, storagePercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Security Policy Status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#edf3f8] text-[#094263] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#094263] text-sm">Policy Enforcement</h3>
              <p className="text-[11px] text-slate-400">Access rules status</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 bg-[#edf3f8] p-2.5 rounded-xl">
            <span>Passcode & Expiry Controls</span>
            <span className="text-emerald-600 font-bold">ACTIVE</span>
          </div>
        </div>

        {/* Quick Share Link Trigger */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#edf3f8] text-[#094263] flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#094263] text-sm">Quick Share File</h3>
              <p className="text-[11px] text-slate-400">Generate controlled link</p>
            </div>
          </div>
          <Link
            to="/files"
            className="w-full py-2.5 bg-[#edf3f8] hover:bg-[#094263] text-[#094263] hover:text-white rounded-xl text-xs font-bold transition text-center block"
          >
            Select File to Share
          </Link>
        </div>
      </div>

      {/* Security Summary Banner */}
      <SecuritySummaryCard />

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-[#094263] text-base">Recent Audit & Sharing Activity</h3>
            <p className="text-xs text-slate-400">Live timestamped activity log</p>
          </div>
          <Link to="/activity" className="text-xs font-bold text-[#094263] hover:underline flex items-center gap-1">
            <span>View Full Audit</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <div className="text-center py-10 bg-[#edf3f8] rounded-xl border border-dashed border-slate-200">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">No activity recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-[#094263] uppercase tracking-wider">
                  <th className="py-3 px-4">User / Action</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {recentActivity.map((act) => (
                  <tr key={act._id} className="hover:bg-[#edf3f8]/50 transition">
                    <td className="py-3.5 px-4 text-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#094263] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-[#094263]">
                            {act.action === 'file_uploaded' && 'File Uploaded'}
                            {act.action === 'file_shared' && 'File Shared'}
                            {act.action === 'file_downloaded' && 'File Downloaded'}
                            {act.action === 'share_revoked' && 'Access Revoked'}
                            {act.action === 'share_created' && 'Share Policy Created'}
                          </p>
                          <p className="text-[10px] text-slate-400">{act.metadata?.downloadedBy || act.metadata?.recipientEmail || 'Owner'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold truncate max-w-[200px]">
                      {act.metadata?.fileName || 'Document'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(act.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold uppercase">
                        SUCCESS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
