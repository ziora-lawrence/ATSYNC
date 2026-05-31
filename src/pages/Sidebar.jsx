import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Sidebar navigation component that lists menu sections, active roster clients, and pending intakes.
 */
export const Sidebar = ({
  clients = [],
  activeClientId,
  pendingIntakeCount,
  loading,
  onClientClick,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const activeClients = clients.filter(c => c.type === 'active');
  const pendingClients = clients.filter(c => c.type === 'pending');

  const isNavActive = (path) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath.startsWith(path);
  };

  const getDotClass = (dot) => {
    if (dot === 'orange') return 'yellow';
    return dot || 'gray';
  };

  return (
    <aside className="db-sidebar">
      <div className="sb-category">MENU</div>
      
      <Link
        to="/dashboard"
        className={`sb-item ${isNavActive('/dashboard') && currentPath === '/dashboard' ? 'active' : ''}`}
      >
        <div className="sb-item-left">
          <i className="ti ti-layout-dashboard"></i>
          <span>Dashboard</span>
        </div>
      </Link>

      <Link
        to="/dashboard/clients"
        className={`sb-item ${isNavActive('/dashboard/clients') ? 'active' : ''}`}
      >
        <div className="sb-item-left">
          <i className="ti ti-users"></i>
          <span>Clients</span>
        </div>
      </Link>

      <Link
        to="/dashboard/intake"
        className={`sb-item ${isNavActive('/dashboard/intake') ? 'active' : ''}`}
      >
        <div className="sb-item-left">
          <i className="ti ti-link"></i>
          <span>Intake Links</span>
        </div>
        {pendingClients.length > 0 && (
          <span className="sb-badge-count">{pendingClients.length}</span>
        )}
      </Link>

      <Link
        to="/dashboard/bob"
        className={`sb-item ${isNavActive('/dashboard/bob') ? 'active' : ''}`}
      >
        <div className="sb-item-left">
          <i className="ti ti-robot"></i>
          <span>Bob</span>
        </div>
        <span className="sb-badge-v1">V1</span>
      </Link>

      <Link
        to="/dashboard/marketplace"
        className={`sb-item ${isNavActive('/dashboard/marketplace') ? 'active' : ''}`}
      >
        <div className="sb-item-left">
          <i className="ti ti-shopping-bag"></i>
          <span>Marketplace</span>
        </div>
        <span className="sb-badge-v1">V1</span>
      </Link>

      <Link
        to="/dashboard/settings"
        className={`sb-item ${isNavActive('/dashboard/settings') ? 'active' : ''}`}
      >
        <div className="sb-item-left">
          <i className="ti ti-settings"></i>
          <span>Settings</span>
        </div>
      </Link>

      {/* Active Roster */}
      <div className="sb-category" style={{ marginTop: '8px' }}>
        ACTIVE ROSTER
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ padding: '6px 14px', fontSize: '10px', color: 'var(--text-secondary)' }}>
            Loading roster...
          </div>
        ) : activeClients.length === 0 ? (
          <div style={{ padding: '6px 14px', fontSize: '10px', color: 'var(--text-secondary)' }}>
            No active clients
          </div>
        ) : (
          activeClients.map((c) => (
            <div
              key={c.id}
              className={`roster-item ${activeClientId === c.id ? 'active' : ''}`}
              onClick={() => onClientClick(c.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span className={`roster-dot ${getDotClass(c.statusDot)}`}></span>
                <span>{c.name}</span>
              </div>
              {activeClientId === c.id && (
                <i className="ti ti-chevron-right roster-arrow"></i>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pending Intake */}
      <div className="sb-category" style={{ marginTop: '6px' }}>
        PENDING INTAKE
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ padding: '5px 14px', fontSize: '10px', color: 'var(--text-secondary)' }}>
            Loading pending...
          </div>
        ) : pendingClients.length === 0 ? (
          <div style={{ padding: '5px 14px', fontSize: '10px', color: 'var(--text-secondary)' }}>
            No pending intake
          </div>
        ) : (
          pendingClients.map((c) => (
            <div
              key={c.id}
              className="roster-item"
              onClick={() => onClientClick(c.id)}
              style={{ padding: '5px 14px', fontSize: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span className="roster-dot gray"></span>
                <span style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
