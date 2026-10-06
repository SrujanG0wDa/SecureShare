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
  Eye, 
  X
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[#094263] tracking-tight">My Secure Files</h1>
          <p className="text-xs text-slate-500 font-medium">Manage documents and generate access control rules.</p>
        </div>
        <button
          onClick={openUploadModal}
          className="px-5 py-2.5 bg-[#094263] hover:bg-[#07324c] text-white font-bold text-xs rounded-full shadow-md transition flex items-center gap-2 uppercase tracking-wide self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files by name..."
            className="w-full pl-10 pr-4 py-2 bg-[#edf3f8] text-[#094263] placeholder-slate-400 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#094263]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#094263]">
            <Filter className="w-4 h-4" />
            <span>Format:</span>
          </div>
          <select
            value={mimeFilter}
            onChange={(e) => setMimeFilter(e.target.value)}
            className="px-4 py-2 bg-[#edf3f8] text-[#094263] rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#094263]"
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

      {/* Files Content Table */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-[#094263] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading files...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-3 shadow-sm">
          <FolderLock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-[#094263] text-base">No files found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || mimeFilter ? 'Try clearing your search filters.' : 'Upload your first file to get started with secure sharing.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-extrabold text-[#094263] uppercase tracking-wider">
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-center">Active Shares</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {files.map((file) => (
                  <tr key={file._id} className="hover:bg-[#edf3f8]/50 transition">
                    <td className="py-3.5 px-4 font-bold text-[#094263]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#094263] text-white flex items-center justify-center shrink-0 font-bold">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate max-w-xs">
                          <p className="font-bold text-[#094263] truncate">{file.fileName}</p>
                          <p className="text-[10px] text-slate-400 font-normal truncate">{file.mimeType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">
                      {formatBytes(file.fileSize)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(file.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex px-3 py-1 text-[10px] font-extrabold rounded-full ${
                        file.activeShareCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {file.activeShareCount || 0} ACTIVE
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => setShareFile(file)}
                        className="px-3 py-1.5 bg-[#094263] text-white rounded-full text-xs font-bold transition hover:bg-[#07324c]"
                        title="Share File"
                      >
                        <Share2 className="w-3.5 h-3.5 inline mr-1" />
                        <span>Share</span>
                      </button>
                      <button
                        onClick={() => handleOwnerDownload(file._id)}
                        className="p-1.5 text-slate-600 hover:bg-[#edf3f8] rounded-full transition"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleViewDetails(file)}
                        className="p-1.5 text-slate-600 hover:bg-[#edf3f8] rounded-full transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file._id, file.fileName)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-full transition"
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

      {/* Details Modal */}
      {fileDetailsModal && selectedFileDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#094263]/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-[#094263] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">File Details</h3>
              <button onClick={() => setFileDetailsModal(false)} className="p-1 text-sky-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="p-4 bg-[#edf3f8] rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-[#094263] uppercase">File Name</span>
                <p className="text-sm font-extrabold text-[#094263]">{selectedFileDetail.fileName}</p>
                <div className="flex gap-4 text-slate-500 pt-2 border-t border-slate-200 mt-2">
                  <span>Size: <strong>{formatBytes(selectedFileDetail.fileSize)}</strong></span>
                  <span>Format: <strong>{selectedFileDetail.mimeType}</strong></span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setFileDetailsModal(false)} className="px-5 py-2 bg-[#094263] text-white rounded-full text-xs font-bold">
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
