import React, { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Sidebar = ({
  clients = [],
  activeClientId,
  pendingIntakeCount,
  loading,
  onClientClick,
  sidebarOpen,
  setSidebarOpen,
  onAddClientClick
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isNavActive = (path) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath.startsWith(path);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('atsync_token');
    localStorage.removeItem('atsync_user');
    navigate('/');
  };

  const agencyUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('atsync_user')) || { agencyName: 'Daniel Z.', email: '' };
    } catch {
      return { agencyName: 'Daniel Z.', email: '' };
    }
  })();

  const getInitials = (name) => {
    if (!name) return 'DZ';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const handleNavClick = useCallback(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);

  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar">
      {/* Brand Top */}
      <div className="sb-top">
        <div className="brand-logo">
          <i className="ti ti-bolt"></i>
        </div>
        <span className="brand-name">ATSYNC</span>
        <i className="ti ti-x sb-close" onClick={() => setSidebarOpen(false)}></i>
      </div>

      {/* Navigation Menu */}
      <div className="nav-wrap">
        <Link
          to="/dashboard"
          className={`ni ${isNavActive('/dashboard') && currentPath === '/dashboard' ? 'active' : ''}`}
          title="Dashboard"
          onClick={handleNavClick}
        >
          <i className="ti ti-layout-dashboard"></i>
          <span className="ni-label">Dashboard</span>
        </Link>

        <Link
          to="/dashboard/clients"
          className={`ni ${isNavActive('/dashboard/clients') ? 'active' : ''}`}
          title="Clients"
          onClick={handleNavClick}
        >
          <i className="ti ti-users"></i>
          <span className="ni-label">Clients</span>
        </Link>

        <Link
          to="/dashboard/payments"
          className={`ni ${isNavActive('/dashboard/payments') ? 'active' : ''}`}
          title="Payments"
          onClick={handleNavClick}
        >
          <i className="ti ti-credit-card"></i>
          <span className="ni-label">Payments</span>
        </Link>

        <div className="ndiv"></div>

        {/* Bob - dimmed link */}
        <Link
          to="/dashboard/bob"
          className={`ni dimmed-link ${isNavActive('/dashboard/bob') ? 'active' : ''}`}
          title="Bob — V1 Preview"
          onClick={handleNavClick}
        >
          <i className="ti ti-robot"></i>
          <span className="ni-label">Bob</span>
          <span className="nb">V1</span>
        </Link>

        {/* Marketplace - dimmed link */}
        <Link
          to="/dashboard/marketplace"
          className={`ni dimmed-link ${isNavActive('/dashboard/marketplace') ? 'active' : ''}`}
          title="Marketplace — V1 Preview"
          onClick={handleNavClick}
        >
          <i className="ti ti-building-store"></i>
          <span className="ni-label">Marketplace</span>
          <span className="nb">V1</span>
        </Link>
      </div>

      {/* Sidebar Bottom */}
      <div className="sb-bot">
        <div className="ndiv"></div>

        {/* Notifications */}
        <div className="ni" title="Notifications">
          <i className="ti ti-bell"></i>
          <span className="ni-label">Notifications</span>
        </div>

        {/* Avatar Profile Trigger */}
        <div className={`sb-avatar-wrap ${profileDropdownOpen ? 'open' : ''}`}>
          <div className="sb-avatar-row" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
            <div className="avatar">{getInitials(agencyUser.agencyName)}</div>
            <span className="sb-name">{agencyUser.agencyName}</span>
          </div>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <div className="profile-dropdown">
              <div
                className="pdrop-item"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  handleNavClick();
                  navigate('/dashboard/settings?tab=profile');
                }}
              >
                <i className="ti ti-user"></i> Profile
              </div>
              <div
                className="pdrop-item"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  handleNavClick();
                  navigate('/dashboard/settings');
                }}
              >
                <i className="ti ti-settings"></i> Settings
              </div>
              <div
                className="pdrop-item"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  handleNavClick();
                  navigate('/dashboard/intake');
                }}
              >
                <i className="ti ti-link"></i> Intake Links
              </div>
              <div className="pdrop-div"></div>
              <div className="pdrop-item danger" onClick={handleSignOut}>
                <i className="ti ti-logout"></i> Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
