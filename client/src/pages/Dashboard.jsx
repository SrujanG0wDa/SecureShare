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
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Users,
  ShieldAlert,
  SlidersHorizontal,
  Lock,
  Layers,
  Award
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

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#093d62] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-[#093d62]">Loading Dashboard Protocol...</span>
        </div>
      </div>
    );
  }

  // Category cards for the middle row (inspired by image)
  const categories = [
    { title: 'Documents & PDF', count: stats?.totalFiles || 0, label: 'Encrypted storage', icon: FileText },
    { title: 'Active Share Policies', count: stats?.activeShares || 0, label: 'Access controlled', icon: Share2 },
    { title: 'Download History', count: stats?.totalDownloads || 0, label: 'Audit logged', icon: Download },
    { title: 'Security Vault', count: '100%', label: 'AES-256 Enabled', icon: Lock },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Floating KPI Stats Row (Matching mockup top stat cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card 1 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 relative pt-7">
          <div className="w-11 h-11 rounded-full bg-[#093d62] text-white flex items-center justify-center absolute -top-4 left-6 shadow-md border-2 border-white">
            <FolderLock className="w-5 h-5" />
          </div>
          <div className="text-right space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Files</span>
            <p className="text-2xl md:text-3xl font-black text-slate-800">{stats?.totalFiles || 0}</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12% stored this week</span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 relative pt-7">
          <div className="w-11 h-11 rounded-full bg-[#093d62] text-white flex items-center justify-center absolute -top-4 left-6 shadow-md border-2 border-white">
            <Share2 className="w-5 h-5" />
          </div>
          <div className="text-right space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Shared Files</span>
            <p className="text-2xl md:text-3xl font-black text-slate-800">{stats?.totalShares || 0}</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+3% active shares</span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 relative pt-7">
          <div className="w-11 h-11 rounded-full bg-[#093d62] text-white flex items-center justify-center absolute -top-4 left-6 shadow-md border-2 border-white">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-right space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Shares</span>
            <p className="text-2xl md:text-3xl font-black text-slate-800">{stats?.activeShares || 0}</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+1% than yesterday</span>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 relative pt-7">
          <div className="w-11 h-11 rounded-full bg-[#093d62] text-white flex items-center justify-center absolute -top-4 left-6 shadow-md border-2 border-white">
            <Download className="w-5 h-5" />
          </div>
          <div className="text-right space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Downloads</span>
            <p className="text-2xl md:text-3xl font-black text-slate-800">{stats?.totalDownloads || 0}</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <span>Just updated</span>
          </div>
        </div>
      </div>

      {/* Middle Category Grid (Matching mockup middle department cards) */}
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 space-y-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#093d62] flex items-center justify-center border border-sky-100">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{cat.title}</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Total Items: <strong className="text-slate-800">{cat.count}</strong></p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Updated just now</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Main Section: File List & Recent Activity Table (Matching mockup table) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Recent Shared & Uploaded Documents</h3>
            <p className="text-xs text-slate-400">Live protocol status for active files</p>
          </div>
          <Link to="/files" className="px-3 py-1.5 bg-[#edf3f8] hover:bg-slate-200 text-[#093d62] text-xs font-bold rounded-xl transition">
            View All Files
          </Link>
        </div>

        {recentFiles.length === 0 ? (
          <div className="text-center py-10 bg-[#f7fafc] rounded-xl border border-dashed border-slate-200">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">No files uploaded yet.</p>
            <button
              onClick={openUploadModal}
              className="mt-2 text-xs font-bold text-[#093d62] hover:underline"
            >
              Upload your first file
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                  <th className="pb-3 px-3">DOCUMENT</th>
                  <th className="pb-3 px-3">FILE SIZE</th>
                  <th className="pb-3 px-3">CREATED</th>
                  <th className="pb-3 px-3 text-center">SHARES</th>
                  <th className="pb-3 px-3 text-center">STATUS</th>
                  <th className="pb-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentFiles.map((file) => (
                  <tr key={file._id} className="hover:bg-[#f7fafc] transition">
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#093d62] text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {file.fileName[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs truncate max-w-[200px]">{file.fileName}</p>
                          <p className="text-[10px] text-slate-400 truncate font-normal">{file.mimeType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-semibold">
                      {formatBytes(file.fileSize)}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-medium">
                      {formatDate(file.createdAt)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-1 bg-sky-50 text-sky-800 rounded-full font-bold text-[10px]">
                        {file.activeShareCount || 0} Active
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] uppercase">
                        ACTIVE
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setShareModalFile(file)}
                        className="px-3 py-1.5 bg-[#093d62] hover:bg-[#0c4a75] text-white font-bold text-[11px] rounded-xl shadow-sm transition"
                      >
                        Share File
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security Summary Component */}
      <SecuritySummaryCard />

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
