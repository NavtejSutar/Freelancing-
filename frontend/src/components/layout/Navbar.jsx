import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiMenu, HiX, HiBell, HiChat, HiLogout, HiUser, HiHome, HiBriefcase, HiDocumentText, HiClipboardList, HiCash, HiStar, HiCog, HiUsers, HiFlag, HiExclamationCircle, HiLightningBolt, HiCollection } from 'react-icons/hi';
import { notificationService } from '../../api/notificationService';
import { useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (user) {
      notificationService.getUnreadCount()
        .then(({ data }) => setUnreadCount(data.data))
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = () => {
    const links = [{ to: '/dashboard', label: 'Dashboard', icon: HiHome }];

    if (user?.role === 'FREELANCER') {
      links.push(
        { to: '/jobs', label: 'Find Jobs', icon: HiBriefcase },
        { to: '/proposals/my', label: 'My Proposals', icon: HiDocumentText },
        { to: '/jobs/active', label: 'Active Jobs', icon: HiCollection },
        { to: '/contracts', label: 'Contracts', icon: HiClipboardList },
      );
    }
    if (user?.role === 'CLIENT') {
      links.push(
        { to: '/jobs/my', label: 'My Jobs', icon: HiBriefcase },
        { to: '/jobs/create', label: 'Post Job', icon: HiDocumentText },
        { to: '/jobs/active', label: 'Active Jobs', icon: HiCollection },
        { to: '/contracts', label: 'Contracts', icon: HiClipboardList },
      );
    }
    if (user?.role === 'ADMIN') {
      links.push(
        { to: '/admin/users', label: 'Users', icon: HiUsers },
        { to: '/admin/skills', label: 'Skills', icon: HiLightningBolt },
        { to: '/admin/reports', label: 'Reports', icon: HiFlag },
        { to: '/admin/disputes', label: 'Disputes', icon: HiExclamationCircle },
        { to: '/admin/withdrawals', label: 'Withdrawals', icon: HiCash },
        { to: '/admin/payments', label: 'Payments', icon: HiCash },
      );
    }
    return links;
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold text-indigo-600">
              FreelanceHub
            </Link>
            <div className="hidden md:flex ml-10 space-x-1">
              {navLinks().map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/messages" className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-gray-100 relative">
              <HiChat className="w-5 h-5" />
            </Link>
            <Link to="/notifications" className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-gray-100 relative">
              <HiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                  <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>
                    <HiUser className="w-4 h-4 mr-2" /> Profile
                  </Link>
                  <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>
                    <HiCog className="w-4 h-4 mr-2" /> Settings
                  </Link>
                  <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <HiLogout className="w-4 h-4 mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks().map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.to)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <link.icon className="w-5 h-5 mr-2" /> {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}