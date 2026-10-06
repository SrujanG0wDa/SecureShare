import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  LayoutDashboard, 
  FolderLock, 
  Share2, 
  Activity as ActivityIcon, 
  User, 
  LogOut, 
  Menu, 
  X,
  Upload,
  Search,
  ChevronRight,
  Bell
} from 'lucide-react';
import FileUploadModal from '../components/FileUploadModal';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Files', path: '/files', icon: FolderLock },
    { label: 'Shared Files', path: '/shared', icon: Share2 },
    { label: 'Activity Audit', path: '/activity', icon: ActivityIcon },
    { label: 'Security Profile', path: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#c8d9e6] p-3 md:p-6 font-sans">
      <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-3rem)] flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl bg-[#dce7f0]/60 backdrop-blur-md border border-white/40">
        {/* Mobile Header */}
        <div className="md:hidden bg-[#093d62] text-white p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5 font-bold text-lg text-white">
            <div className="w-8 h-8 rounded-full bg-white text-[#093d62] font-black flex items-center justify-center text-sm shadow-md">
              S
            </div>
            <span>SecureShare</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-200 hover:text-white rounded-xl hover:bg-[#0c4a75]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Left Navy Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-[#093d62] text-slate-200 p-5 shrink-0 justify-between rounded-l-3xl">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-10 h-10 rounded-full bg-white text-[#093d62] font-black flex items-center justify-center text-xl shadow-lg">
                P
              </div>
              <div>
                <h1 className="font-bold text-lg text-white tracking-tight leading-none">SecureShare</h1>
                <p className="text-[11px] text-indigo-200 font-medium mt-1">Control Protocol</p>
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setUploadModalOpen(true)}
              className="w-full py-3 px-4 bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-white font-semibold rounded-2xl shadow-lg shadow-sky-500/20 transition flex items-center justify-center gap-2 text-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Secure File</span>
            </button>

            {/* Nav links */}
            <nav className="space-y-2 pt-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-xs transition ${
                      isActive
                        ? 'bg-white text-[#093d62] shadow-md shadow-black/10'
                        : 'text-slate-200 hover:bg-[#0c4a75]/70 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#093d62]' : 'text-slate-300'}`} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Bottom Logout */}
          <div className="pt-4 border-t border-[#0d4f7d]">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-3 text-xs font-semibold text-slate-300 hover:text-white hover:bg-rose-500/20 rounded-xl transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-[#093d62]/95 backdrop-blur-md flex flex-col p-6 text-white">
            <div className="flex justify-between items-center pb-4 border-b border-slate-700">
              <div className="flex items-center gap-2 font-bold text-lg">
                <div className="w-8 h-8 rounded-full bg-white text-[#093d62] font-black flex items-center justify-center">S</div>
                <span>SecureShare</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="py-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setUploadModalOpen(true);
                }}
                className="w-full py-3 bg-sky-500 text-white font-semibold rounded-2xl flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Secure File</span>
              </button>
            </div>

            <nav className="space-y-2 flex-1 my-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold ${
                        isActive ? 'bg-white text-[#093d62]' : 'text-slate-200 hover:bg-[#0c4a75]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </NavLink>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="py-3 px-4 bg-rose-500/20 text-rose-300 font-semibold rounded-2xl flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        )}

        {/* Right Main Panel */}
        <div className="flex-1 min-w-0 flex flex-col p-4 md:p-6 overflow-y-auto space-y-6">
          {/* Top Bar Header */}
          <div className="bg-white rounded-2xl p-3 md:px-6 md:py-3 shadow-sm flex items-center justify-between border border-slate-200/60">
            {/* Search Input */}
            <div className="relative w-72 md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search here..."
                className="w-full pl-10 pr-4 py-2 bg-[#edf3f8] text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 text-slate-700 font-medium"
              />
            </div>

            {/* Profile Avatar Header */}
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 relative">
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 bg-rose-500 rounded-full absolute top-1.5 right-1.5" />
              </button>

              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                  {user?.name ? user.name[0].toUpperCase() : 'A'}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name || 'User Name'}</p>
                  <p className="text-[10px] font-medium text-slate-400">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Outlet */}
          <div className="flex-1">
            <Outlet context={{ openUploadModal: () => setUploadModalOpen(true) }} />
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <FileUploadModal onClose={() => setUploadModalOpen(false)} onSuccess={() => window.location.reload()} />
      )}
    </div>
  );
};

export default Layout;
