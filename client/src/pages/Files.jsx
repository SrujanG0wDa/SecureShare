import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import API from '../services/api';
import { formatBytes, formatDate } from '../utils/formatters';
import SecureShareModal from '../components/SecureShareModal';
import { 
  FolderLock, 
  Search, 
  Filter, 
  Plus, 
  Share2, 
  Download, 
  Trash2, 
  FileText, 
  MoreVertical, 
  Eye, 
  X,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Files = () => {
  const { openUploadModal } = useOutletContext() || {};
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mimeFilter, setMimeFilter] = useState('');

  // Selected file for sharing & details
  const [shareFile, setShareFile] = useState(null);
  const [selectedFileDetail, setSelectedFileDetail] = useState(null);
  const [fileDetailsModal, setFileDetailsModal] = useState(false);
  const [fileDetailData, setFileDetailData] = useState(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      let url = `/files?search=${encodeURIComponent(search)}`;
      if (mimeFilter) url += `&type=${encodeURIComponent(mimeFilter)}`;
      const res = await API.get(url);
      if (res.data.success) {
        setFiles(res.data.data.files);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchFiles, 300);
    return () => clearTimeout(timer);
  }, [search, mimeFilter]);

  const handleDeleteFile = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"? Active share links will be revoked.`)) {
      return;
    }

    try {
      const res = await API.delete(`/files/${fileId}`);
      if (res.data.success) {
        toast.success('File deleted');
        fetchFiles();
      }
    } catch (err) {
      toast.error('Failed to delete file');
    }
  };

  const handleOwnerDownload = async (fileId) => {
    try {
      const res = await API.get(`/files/${fileId}/download`);
      if (res.data.success) {
        window.open(res.data.data.downloadUrl, '_blank');
      }
    } catch (err) {
      toast.error('Failed to download file');
    }
  };

  const handleViewDetails = async (file) => {
    setSelectedFileDetail(file);
    setFileDetailsModal(true);
    try {
      const res = await API.get(`/files/${file._id}`);
      if (res.data.success) {
        setFileDetailData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">My Secure Files</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your uploaded documents and create access-controlled sharing policies.
          </p>
        </div>
        <button
          onClick={openUploadModal}
          className="px-4 py-2.5 bg-[#093d62] hover:bg-[#0c4a75] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files by name..."
            className="w-full pl-10 pr-4 py-2 bg-[#edf3f8] border border-slate-200/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#093d62] text-slate-700 font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Filter className="w-4 h-4 text-[#093d62]" />
            <span>Format:</span>
          </div>
          <select
            value={mimeFilter}
            onChange={(e) => setMimeFilter(e.target.value)}
            className="px-3 py-2 bg-[#edf3f8] border border-slate-200/60 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#093d62]"
          >
            <option value="">All Formats</option>
            <option value="pdf">PDF Documents</option>
            <option value="image">Images (PNG/JPG)</option>
            <option value="word">Word / Docs</option>
            <option value="excel">Spreadsheets</option>
            <option value="zip">Archives / Zip</option>
          </select>
        </div>
      </div>

      {/* Files Content Area */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="w-8 h-8 border-4 border-[#093d62] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-500">Loading secure vault...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-3 shadow-sm">
          <FolderLock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No files found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search || mimeFilter ? 'Try clearing your search filters.' : 'Upload your first file to get started with secure sharing.'}
          </p>
          {!search && !mimeFilter && (
            <button
              onClick={openUploadModal}
              className="px-4 py-2 bg-[#093d62] hover:bg-[#0c4a75] text-white rounded-xl text-xs font-bold transition"
            >
              Upload Now
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7fafc] border-b border-slate-200/60 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">FILE NAME</th>
                <th className="py-3.5 px-4">SIZE</th>
                <th className="py-3.5 px-4">UPLOADED</th>
                <th className="py-3.5 px-4 text-center">ACTIVE SHARES</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {files.map((file) => (
                <tr key={file._id} className="hover:bg-[#f7fafc] transition">
                  <td className="py-4 px-6 font-semibold text-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#093d62] text-white font-bold flex items-center justify-center text-xs shrink-0">
                        {file.fileName[0].toUpperCase()}
                      </div>
                      <div className="truncate max-w-xs">
                        <p className="font-bold text-slate-800 truncate">{file.fileName}</p>
                        <p className="text-[10px] text-slate-400 font-normal truncate">{file.mimeType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-semibold">
                    {formatBytes(file.fileSize)}
                  </td>
                  <td className="py-4 px-4 text-slate-500 font-medium">
                    {formatDate(file.createdAt)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-sky-50 text-sky-800">
                      {file.activeShareCount || 0} active
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-1">
                    <button
                      onClick={() => setShareFile(file)}
                      className="px-3 py-1.5 bg-[#093d62] hover:bg-[#0c4a75] text-white font-bold rounded-xl transition text-[11px]"
                    >
                      Share
                    </button>
                    <button
                      onClick={() => handleOwnerDownload(file._id)}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleViewDetails(file)}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file._id, file.fileName)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Share Modal */}
      {shareFile && (
        <SecureShareModal
          file={shareFile}
          onClose={() => setShareFile(null)}
          onSuccess={() => fetchFiles()}
        />
      )}

      {/* File Details Modal */}
      {fileDetailsModal && selectedFileDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#093d62]/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-[#093d62] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">File Details</h3>
              <button onClick={() => setFileDetailsModal(false)} className="p-1 text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">File Name</p>
                <p className="text-sm font-bold text-slate-800">{selectedFileDetail.fileName}</p>
                <div className="flex gap-4 text-xs text-slate-500 pt-2 border-t border-slate-200/60 mt-2">
                  <span>Size: <strong>{formatBytes(selectedFileDetail.fileSize)}</strong></span>
                  <span>Type: <strong>{selectedFileDetail.mimeType}</strong></span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">Active Policies ({fileDetailData?.shares?.length || 0})</h4>
                {!fileDetailData?.shares || fileDetailData.shares.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No share links generated yet.</p>
                ) : (
                  <div className="space-y-2">
                    {fileDetailData.shares.map((s) => (
                      <div key={s._id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-800">Recipients: {s.authorizedEmails?.join(', ')}</span>
                          <span className="text-[#093d62] uppercase font-bold">{s.status}</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">Downloads: {s.downloadCount} {s.downloadLimit ? `/ ${s.downloadLimit}` : ''}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setFileDetailsModal(false)}
                className="px-4 py-2 bg-[#093d62] text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Files;
