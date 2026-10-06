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
  const [globalSearch, setGlobalSearch] = useState('');

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

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      navigate(`/files?search=${encodeURIComponent(globalSearch)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#94b5cd] p-2 sm:p-4 md:p-6 flex items-center justify-center font-sans antialiased">
      {/* Main Outer App Frame matching Theme Image */}
      <div className="w-full max-w-[1600px] min-h-[92vh] bg-[#e4edf5] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-white/60 p-3 sm:p-5 flex flex-col md:flex-row gap-5 relative overflow-hidden">

        {/* Desktop Sidebar (Theme Deep Navy Blue) */}
        <aside className="hidden md:flex flex-col w-64 bg-[#094263] text-white rounded-[2rem] p-6 shrink-0 shadow-lg justify-between relative z-10">
          <div>
            {/* Logo Brand Header */}
            <div className="flex items-center gap-3 px-2 mb-8">
              <div className="w-10 h-10 rounded-full bg-white text-[#094263] flex items-center justify-center font-extrabold text-xl shadow-md">
                <Shield className="w-6 h-6 fill-[#094263]" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-tight text-white leading-none">SecureShare</h1>
                <p className="text-[10px] text-sky-200/80 font-medium tracking-wide mt-1">Controlled Storage</p>
              </div>
            </div>

            {/* Upload Action Button */}
            <button
              onClick={() => setUploadModalOpen(true)}
              className="w-full py-3 px-4 mb-6 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs rounded-full shadow-md transition flex items-center justify-center gap-2 tracking-wide uppercase"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Secure File</span>
            </button>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3.5 px-5 py-3.5 rounded-full font-semibold text-xs transition duration-200 ${
                      isActive
                        ? 'bg-white text-[#094263] shadow-md font-bold'
                        : 'text-sky-100/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#094263]' : 'text-sky-200/90'}`} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Logout Button at bottom */}
          <div className="pt-6 border-t border-sky-800/60">
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 text-xs font-semibold text-sky-200 hover:text-white hover:bg-white/10 rounded-full transition flex items-center gap-3"
            >
              <LogOut className="w-4 h-4 text-sky-300" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden bg-[#094263] text-white p-4 rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 font-bold text-base">
            <div className="w-8 h-8 rounded-full bg-white text-[#094263] flex items-center justify-center">
              <Shield className="w-5 h-5 fill-[#094263]" />
            </div>
            <span>SecureShare</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-sky-100 hover:bg-white/10 rounded-xl"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-[#094263] text-white p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center pb-4 border-b border-sky-800">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Shield className="w-6 h-6" />
                <span>SecureShare</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-3 my-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-5 py-4 rounded-full font-semibold ${
                        isActive ? 'bg-white text-[#094263]' : 'text-sky-100 hover:bg-white/10'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </NavLink>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="w-full py-3 bg-white/10 text-white rounded-full font-semibold flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        )}

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 space-y-5">
          {/* Top Capsule Header matching Theme Image */}
          <header className="bg-white rounded-full px-6 py-3 shadow-sm flex items-center justify-between gap-4 border border-slate-100">
            {/* Pill Search Bar */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search files, policies..."
                className="w-full pl-5 pr-10 py-2 bg-[#edf3f8] text-[#094263] placeholder-slate-400 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#094263] transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Right Profile Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-[#094263] truncate max-w-[140px]">{user?.name || 'Alex Tori'}</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{user?.email}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#094263] text-white font-bold text-xs flex items-center justify-center shadow-md">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              </div>
            </div>
          </header>

          {/* Dynamic Page Views */}
          <div className="flex-1 overflow-y-auto pr-1">
            <Outlet context={{ openUploadModal: () => setUploadModalOpen(true) }} />
          </div>
        </div>

      </div>

      {/* Shared Upload Modal */}
      {uploadModalOpen && (
        <FileUploadModal onClose={() => setUploadModalOpen(false)} onSuccess={() => window.location.reload()} />
      )}
    </div>
  );
};

export default Layout;
