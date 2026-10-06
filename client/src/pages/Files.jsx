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
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">My Secure Files</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Manage your uploaded documents and create access-controlled sharing policies.
          </p>
        </div>
        <button
          onClick={openUploadModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files by name..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Type:</span>
          </div>
          <select
            value={mimeFilter}
            onChange={(e) => setMimeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading your files...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
          <FolderLock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800 text-base">No files found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || mimeFilter ? 'Try clearing your search filters.' : 'Upload your first file to get started with secure sharing.'}
          </p>
          {!search && !mimeFilter && (
            <button
              onClick={openUploadModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition"
            >
              Upload Now
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">File Name</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Uploaded</th>
                  <th className="py-3.5 px-4 text-center">Active Shares</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {files.map((file) => (
                  <tr key={file._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate max-w-xs">
                          <p className="font-semibold text-slate-800 truncate">{file.fileName}</p>
                          <p className="text-[11px] text-slate-400 font-normal truncate">{file.mimeType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-xs font-medium">
                      {formatBytes(file.fileSize)}
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-xs">
                      {formatDate(file.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        file.activeShareCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {file.activeShareCount || 0} active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-1">
                      <button
                        onClick={() => setShareFile(file)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                        title="Share File"
                      >
                        <Share2 className="w-4 h-4" />
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

          {/* Mobile Card List View (Visible on mobile) */}
          <div className="md:hidden space-y-3">
            {files.map((file) => (
              <div key={file._id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-semibold text-slate-900 text-sm truncate">{file.fileName}</h4>
                      <p className="text-xs text-slate-400">{formatBytes(file.fileSize)} • {formatDate(file.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                    file.activeShareCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {file.activeShareCount || 0} active share(s)
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShareFile(file)}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={() => handleOwnerDownload(file._id)}
                      className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file._id, file.fileName)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-semibold text-lg">File Audit Details</h3>
              <button onClick={() => setFileDetailsModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase">File Name</p>
                <p className="text-base font-bold text-slate-800">{selectedFileDetail.fileName}</p>
                <div className="flex gap-4 text-xs text-slate-500 pt-2 border-t border-slate-200/60 mt-2">
                  <span>Size: <strong>{formatBytes(selectedFileDetail.fileSize)}</strong></span>
                  <span>Type: <strong>{selectedFileDetail.mimeType}</strong></span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-2">Active Sharing Policies ({fileDetailData?.shares?.length || 0})</h4>
                {!fileDetailData?.shares || fileDetailData.shares.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No share links generated for this file.</p>
                ) : (
                  <div className="space-y-2">
                    {fileDetailData.shares.map((s) => (
                      <div key={s._id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-800">Recipients: {s.authorizedEmails?.join(', ')}</span>
                          <span className="text-indigo-600 uppercase">{s.status}</span>
                        </div>
                        <p className="text-slate-400">Downloads: {s.downloadCount} {s.downloadLimit ? `/ ${s.downloadLimit}` : ''}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setFileDetailsModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
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
