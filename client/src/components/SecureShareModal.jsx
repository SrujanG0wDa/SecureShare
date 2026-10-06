import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  UserPlus, 
  Lock, 
  Clock, 
  Download, 
  Bell, 
  Copy, 
  Check, 
  QrCode as QrIcon, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const SecureShareModal = ({ file, onClose, onSuccess }) => {
  const [recipientInput, setRecipientInput] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [expiryOption, setExpiryOption] = useState('24h');
  const [customExpiryDate, setCustomExpiryDate] = useState('');
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [hasDownloadLimit, setHasDownloadLimit] = useState(false);
  const [downloadLimit, setDownloadLimit] = useState(3);
  const [notifyOnDownload, setNotifyOnDownload] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdShare, setCreatedShare] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // User search suggestions
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (recipientInput.trim().length >= 2) {
        setSearching(true);
        try {
          const res = await API.get(`/users/search?q=${encodeURIComponent(recipientInput)}`);
          if (res.data.success) {
            setSearchResults(res.data.data.users);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const timeout = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeout);
  }, [recipientInput]);

  const addRecipient = (emailToAdd) => {
    const email = (emailToAdd || recipientInput).trim().toLowerCase();
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!email) return;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (recipients.includes(email)) {
      setError('Recipient already added.');
      return;
    }

    setRecipients([...recipients, email]);
    setRecipientInput('');
    setSearchResults([]);
    setError('');
  };

  const removeRecipient = (emailToRemove) => {
    setRecipients(recipients.filter((e) => e !== emailToRemove));
  };

  const handleCreateShare = async () => {
    if (recipients.length === 0) {
      setError('Please add at least one recipient email.');
      return;
    }

    if (passwordProtected && (!password || password.length < 4)) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        fileId: file._id,
        recipientEmails: recipients,
        expiresIn: expiryOption !== 'custom' ? expiryOption : undefined,
        expiresAt: expiryOption === 'custom' ? customExpiryDate : undefined,
        password: passwordProtected ? password : null,
        downloadLimit: hasDownloadLimit ? parseInt(downloadLimit) : null,
        notifyOnDownload
      };

      const res = await API.post('/shares', payload);

      if (res.data.success) {
        setCreatedShare(res.data.data);
        toast.success('Secure share link created!');
        if (onSuccess) onSuccess(res.data.data.share);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create share link.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-lg">Share File</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* File summary */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
            <div className="truncate">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 block mb-0.5">Selected File</span>
              <p className="text-sm font-semibold text-slate-800 truncate">{file?.fileName}</p>
            </div>
            <span className="text-xs font-medium text-slate-500 shrink-0 ml-2">{(file?.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!createdShare ? (
            <>
              {/* Recipients Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Authorized Recipients <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={recipientInput}
                      onChange={(e) => setRecipientInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRecipient();
                        }
                      }}
                      placeholder="Enter user email (e.g. rahul@example.com)"
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => addRecipient()}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition flex items-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Suggestions dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden max-h-40 overflow-y-auto">
                      {searchResults.map((u) => (
                        <button
                          key={u._id}
                          onClick={() => addRecipient(u.email)}
                          className="w-full text-left px-3.5 py-2 hover:bg-indigo-50 text-xs flex justify-between items-center"
                        >
                          <span className="font-medium text-slate-800">{u.name}</span>
                          <span className="text-slate-500">{u.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {recipients.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-medium rounded-full"
                      >
                        ✓ {email}
                        <button
                          type="button"
                          onClick={() => removeRecipient(email)}
                          className="hover:text-rose-600 focus:outline-none"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Expiry Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Access Expiry</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: '1h', label: '1 Hour' },
                    { id: '6h', label: '6 Hours' },
                    { id: '24h', label: '24 Hours' },
                    { id: '7d', label: '7 Days' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setExpiryOption(opt.id)}
                      className={`py-2 text-xs font-medium rounded-xl border transition ${
                        expiryOption === opt.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password Protection */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-semibold text-slate-800">Password Protection</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={passwordProtected}
                      onChange={(e) => setPasswordProtected(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {passwordProtected && (
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>

              {/* Download Limit */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-semibold text-slate-800">Limit Max Downloads</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDownloadLimit}
                      onChange={(e) => setHasDownloadLimit(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {hasDownloadLimit && (
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={downloadLimit}
                      onChange={(e) => setDownloadLimit(e.target.value)}
                      className="w-24 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-500">Max downloads before link auto-locks</span>
                  </div>
                )}
              </div>

              {/* Notification toggle */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <Bell className="w-4 h-4 text-indigo-500" />
                  <span>Notify me on download</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOnDownload}
                  onChange={(e) => setNotifyOnDownload(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
            </>
          ) : (
            /* Share Created Success View */
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center space-y-2 py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-800 text-lg">Secure Link Generated!</h4>
                <p className="text-xs text-slate-500">Only authorized recipients can access this link with your policies.</p>
              </div>

              {/* Link Copy Box */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Share Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdShare.shareLink}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono truncate"
                  />
                  <button
                    onClick={() => copyToClipboard(createdShare.shareLink, 'link')}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Short Code */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Access Code</span>
                  <span className="text-sm font-bold font-mono tracking-widest text-slate-900">{createdShare.shortCode}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(createdShare.shortCode, 'code')}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg transition"
                >
                  {copiedCode ? 'Copied' : 'Copy Code'}
                </button>
              </div>

              {/* QR Code toggle */}
              <div className="border-t border-slate-100 pt-3">
                <button
                  onClick={() => setShowQr(!showQr)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition flex items-center justify-center gap-2"
                >
                  <QrIcon className="w-4 h-4 text-indigo-600" />
                  <span>{showQr ? 'Hide QR Code' : 'Show Share QR Code'}</span>
                </button>

                {showQr && (
                  <div className="mt-4 p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(createdShare.shareLink)}`} 
                      alt="Share QR Code"
                      className="w-40 h-40 rounded-lg shadow-md border border-slate-100" 
                    />
                    <p className="text-[11px] text-slate-400 mt-2">Scan to open share link</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          {!createdShare ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateShare}
                disabled={loading}
                className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 transition flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Create Secure Share</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecureShareModal;
