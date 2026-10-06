import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { formatDate, getStatusBadgeClass, formatStatusText } from '../utils/formatters';
import { 
  Share2, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  Ban, 
  Clock, 
  Download, 
  Lock, 
  FileText, 
  QrCode as QrIcon, 
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const SharedFiles = () => {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // QR Modal
  const [activeQrShare, setActiveQrShare] = useState(null);

  const fetchShares = async () => {
    setLoading(true);
    try {
      let url = `/shares?search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;
      const res = await API.get(url);
      if (res.data.success) {
        setShares(res.data.data.shares);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load shared links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchShares, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleRevoke = async (shareId, fileName) => {
    if (!window.confirm(`Are you sure you want to revoke access to "${fileName}"? Recipients will immediately lose download access.`)) {
      return;
    }

    try {
      const res = await API.post(`/shares/${shareId}/revoke`);
      if (res.data.success) {
        toast.success('Access revoked immediately!');
        fetchShares();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke access');
    }
  };

  const copyShareLink = (token, shareId) => {
    const clientUrl = window.location.origin;
    const link = `${clientUrl}/share/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(shareId);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Share link copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-[#094263] tracking-tight">Shared Links Policy Center</h1>
        <p className="text-xs text-slate-500 font-medium">Manage recipient permissions, expiration rules & revocation.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by file name or recipient email..."
            className="w-full pl-10 pr-4 py-2 bg-[#edf3f8] text-[#094263] placeholder-slate-400 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#094263]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#094263]">
            <Filter className="w-4 h-4" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[#edf3f8] text-[#094263] rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#094263]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Links</option>
            <option value="expired">Expired Links</option>
            <option value="revoked">Revoked Links</option>
            <option value="limit_reached">Limit Reached</option>
          </select>
        </div>
      </div>

      {/* Shares List */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-[#094263] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading policies...</p>
        </div>
      ) : shares.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-3 shadow-sm">
          <Share2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-[#094263] text-base">No shared links found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || statusFilter ? 'Try clearing filters.' : 'Share a file from the "My Files" section to generate your first link.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {shares.map((share) => (
            <div key={share._id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded-full bg-[#094263] text-white flex items-center justify-center font-bold shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h3 className="font-extrabold text-[#094263] text-sm truncate">
                      {share.fileId?.fileName || 'Deleted File'}
                    </h3>
                    <p className="text-[11px] text-slate-400">Created {formatDate(share.createdAt)}</p>
                  </div>
                </div>

                <span className={`px-3 py-1 text-[10px] font-extrabold rounded-full border uppercase self-start sm:self-auto ${getStatusBadgeClass(share.status)}`}>
                  {formatStatusText(share.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs bg-[#edf3f8] p-4 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold text-[#094263] uppercase block mb-1">Recipients</span>
                  <div className="flex flex-wrap gap-1">
                    {share.authorizedEmails?.map((email) => (
                      <span key={email} className="px-2 py-0.5 bg-white rounded text-[#094263] font-semibold truncate max-w-[180px]">
                        {email}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#094263] uppercase block mb-1">Access Expiry</span>
                  <p className="font-semibold text-slate-700 flex items-center gap-1 mt-1">
                    <Clock className="w-3.5 h-3.5 text-[#094263]" />
                    <span>{formatDate(share.expiresAt)}</span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#094263] uppercase block mb-1">Download Stats</span>
                  <p className="font-semibold text-slate-700 flex items-center gap-1 mt-1">
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>{share.downloadCount} {share.downloadLimit ? `/ ${share.downloadLimit} limit` : 'downloads'}</span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#094263] uppercase block mb-1">Security Passcode</span>
                  <p className="font-semibold text-slate-700 flex items-center gap-1 mt-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{share.passwordProtected ? 'Password Hash Active' : 'Standard Link'}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-[#edf3f8] px-3 py-1 rounded-full text-[#094263] font-bold">Code: {share.shortCode || 'N/A'}</span>
                  <button
                    onClick={() => setActiveQrShare(share)}
                    className="p-1.5 bg-[#edf3f8] hover:bg-slate-200 text-[#094263] rounded-full text-xs font-bold transition"
                    title="Show QR Code"
                  >
                    <QrIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyShareLink(share.token, share._id)}
                    className="px-4 py-1.5 bg-[#094263] hover:bg-[#07324c] text-white rounded-full text-xs font-bold transition flex items-center gap-1.5"
                  >
                    {copiedId === share._id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === share._id ? 'Copied' : 'Copy Link'}</span>
                  </button>

                  {share.status === 'active' && (
                    <button
                      onClick={() => handleRevoke(share._id, share.fileId?.fileName)}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-full text-xs font-bold transition border border-rose-200"
                    >
                      <Ban className="w-3.5 h-3.5 inline mr-1" />
                      <span>Revoke</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {activeQrShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#094263]/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm p-6 text-center relative space-y-4">
            <button onClick={() => setActiveQrShare(null)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-[#094263] text-base">Scan Share QR Code</h3>
            <p className="text-xs text-slate-500">{activeQrShare.fileId?.fileName}</p>
            <div className="p-4 bg-[#edf3f8] rounded-2xl inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}/share/${activeQrShare.token}`)}`}
                alt="Share QR Code"
                className="w-44 h-44 rounded-lg shadow-sm"
              />
            </div>
            <button onClick={() => setActiveQrShare(null)} className="w-full py-2.5 bg-[#094263] text-white rounded-full text-xs font-bold">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedFiles;
