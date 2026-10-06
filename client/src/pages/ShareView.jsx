import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { formatBytes, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Lock, 
  Download, 
  Clock, 
  AlertCircle, 
  Ban, 
  CheckCircle2, 
  FileText, 
  Key, 
  ShieldAlert,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const ShareView = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Clean token extraction (tokens are 64-char hex strings)
  const rawToken = params.token || params['*'] || window.location.pathname.split('/share/')[1] || '';
  const token = rawToken.replace(/[^a-f0-9]/gi, '');

  const [shareInfo, setShareInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null); // 'revoked' | 'expired' | 'limit_reached' | 'unauthorized' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetail, setErrorDetail] = useState('');

  // Password verification
  const [password, setPassword] = useState('');
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  // Download processing state
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const fetchShareDetails = async () => {
    setLoading(true);
    setErrorStatus(null);

    if (!token) {
      setErrorStatus('error');
      setErrorMessage('Invalid Share Link');
      setErrorDetail('The share link format is invalid.');
      setLoading(false);
      return;
    }

    try {
      const res = await API.get(`/share/${token}`);
      if (res.data && res.data.success) {
        const info = res.data.data?.share || {};
        setShareInfo(info);
        if (info.passwordProtected) {
          setPasswordRequired(true);
        }
      } else {
        setErrorStatus('error');
        setErrorMessage(res.data?.message || 'Link Not Found');
        setErrorDetail(res.data?.detail || 'This shared file link does not exist.');
      }
    } catch (err) {
      console.error('Share fetch error:', err);
      const status = err.response?.data?.status || 'error';
      setErrorStatus(status);
      setErrorMessage(err.response?.data?.message || 'Share Link Not Found');
      setErrorDetail(err.response?.data?.detail || 'This share link does not exist or has expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShareDetails();
  }, [token]);

  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    if (!password) {
      setPasswordError('Please enter the security password.');
      return;
    }

    setVerifyingPassword(true);
    setPasswordError('');

    try {
      const res = await API.post(`/share/${token}/verify`, { password });
      if (res.data && res.data.success) {
        setPasswordVerified(true);
        setPasswordRequired(false);
        toast.success('Password verified!');
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Incorrect password. Access denied.');
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const config = {};
      if (shareInfo?.passwordProtected && password) {
        config.headers = { 'x-share-password': password };
      }

      const res = await API.get(`/share/${token}/download`, config);
      if (res.data && res.data.success) {
        const { downloadUrl, fileName } = res.data.data;
        
        // Trigger browser file download
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileName || 'download';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setDownloadSuccess(true);
        toast.success('File download initiated!');
        fetchShareDetails(); // Refresh download count
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Download failed. Access condition changed.');
      if (err.response?.data?.status) {
        setErrorStatus(err.response.data.status);
        setErrorMessage(err.response.data.message);
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-indigo-300">Verifying security parameters & token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-4 relative overflow-hidden font-sans text-slate-100">
      {/* Glow Effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between py-4 relative z-10">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <div className="p-1.5 bg-indigo-600 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <span>SecureShare</span>
        </div>
        {user ? (
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-xl text-slate-300 transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-xl text-white transition"
          >
            Sign In
          </button>
        )}
      </div>

      {/* Main Content Card */}
      <div className="max-w-md w-full mx-auto my-auto relative z-10 py-6">
        {/* Error Cards for Revoked / Expired / Limit Reached / Unauthorized / Not Found */}
        {errorStatus ? (
          <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-center space-y-4 shadow-2xl animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              {errorStatus === 'revoked' && <Ban className="w-8 h-8" />}
              {errorStatus === 'expired' && <Clock className="w-8 h-8" />}
              {errorStatus === 'limit_reached' && <ShieldAlert className="w-8 h-8" />}
              {errorStatus === 'unauthorized' && <Lock className="w-8 h-8" />}
              {errorStatus === 'error' && <AlertCircle className="w-8 h-8" />}
            </div>

            <h2 className="text-xl font-bold text-white">{errorMessage}</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">{errorDetail}</p>

            {errorStatus === 'unauthorized' && !user && (
              <div className="pt-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
                >
                  Sign In to Verify Account
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Valid Share Access View */
          <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
            {/* Document Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
                <FileText className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight truncate max-w-xs mx-auto">
                {shareInfo?.fileName || 'Secure Document'}
              </h2>
              <p className="text-xs text-slate-400">
                Shared securely by <span className="text-slate-200 font-semibold">{shareInfo?.sharedBy || 'File Owner'}</span>
              </p>
            </div>

            {/* Metadata badges */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">File Size</span>
                <span className="font-semibold text-slate-200">{formatBytes(shareInfo?.fileSize || 0)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Expires At</span>
                <span className="font-semibold text-slate-200">{formatDate(shareInfo?.expiresAt)}</span>
              </div>
            </div>

            {/* Password Verification Prompt if protected */}
            {passwordRequired && !passwordVerified ? (
              <form onSubmit={handleVerifyPassword} className="space-y-4 pt-2">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-2.5 text-xs text-indigo-300">
                  <Lock className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>This file is password-protected. Enter the passcode to unlock download access.</span>
                </div>

                {passwordError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Passcode</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifyingPassword}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2"
                >
                  {verifyingPassword ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Verify & Continue</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Download Action Button */
              <div className="space-y-4 pt-2">
                {downloadSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>File downloaded! Check your downloads folder.</span>
                  </div>
                )}

                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Preparing Secure Stream...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Download Secure File</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Server-authenticated access control enabled</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-slate-500 relative z-10">
        SecureShare Platform — Controlled Encrypted File Sharing
      </div>
    </div>
  );
};

export default ShareView;
