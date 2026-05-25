import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({
  clients,
  activeClientId,
  pendingIntakeCount,
  loading,
  onClientClick,
  location: _loc // passed from parent but we call useLocation internally
}) => {
  const location = useLocation();

  return (
    <aside className="db-sidebar">
      <div className="sb-category">MENU</div>

      <Link to="/dashboard" className={`sb-item ${location.pathname === '/dashboard' || location.pathname === '/dashboard/' ? 'active' : ''}`}>
        <div className="sb-item-left">
          <i className="ti ti-layout-dashboard"></i>
          Dashboard
        </div>
      </Link>

      <Link to="/dashboard/clients" className={`sb-item ${location.pathname === '/dashboard/clients' ? 'active' : ''}`}>
        <div className="sb-item-left">
          <i className="ti ti-users"></i>
          Clients
        </div>
      </Link>

      <Link to="/dashboard/intake" className={`sb-item ${location.pathname === '/dashboard/intake' ? 'active' : ''}`}>
        <div className="sb-item-left">
          <i className="ti ti-link"></i>
          Intake Links
        </div>
        {loading ? (
          <span className="db-skeleton" style={{ width: '16px', height: '16px', borderRadius: '4px' }}></span>
        ) : (
          <span className="sb-badge-count">{pendingIntakeCount}</span>
        )}
      </Link>

      <Link to="/dashboard/bob" className={`sb-item ${location.pathname === '/dashboard/bob' ? 'active' : ''}`}>
        <div className="sb-item-left">
          <i className="ti ti-robot"></i>
          Bob
        </div>
        <span className="sb-badge-v1">V1</span>
      </Link>

      <Link to="/dashboard/marketplace" className={`sb-item ${location.pathname === '/dashboard/marketplace' ? 'active' : ''}`}>
        <div className="sb-item-left">
          <i className="ti ti-shopping-bag"></i>
          Marketplace
        </div>
        <span className="sb-badge-v1">V1</span>
      </Link>

      <Link to="/dashboard/settings" className={`sb-item ${location.pathname === '/dashboard/settings' ? 'active' : ''}`}>
        <div className="sb-item-left">
          <i className="ti ti-settings"></i>
          Settings
        </div>
      </Link>

      {/* ACTIVE ROSTER */}
      <div className="sb-category">ACTIVE ROSTER</div>
      {loading ? (
        <>
          <div className="sb-item db-skeleton" style={{ margin: '8px 24px', height: '20px', borderRadius: '4px' }}></div>
          <div className="sb-item db-skeleton" style={{ margin: '8px 24px', height: '20px', borderRadius: '4px' }}></div>
          <div className="sb-item db-skeleton" style={{ margin: '8px 24px', height: '20px', borderRadius: '4px' }}></div>
        </>
      ) : (
        clients
          .filter(c => c.type === 'active')
          .map(c => (
            <div
              key={c.id}
              className={`roster-item ${c.id === activeClientId ? 'active' : ''}`}
              onClick={() => onClientClick(c.id)}
            >
              <div className="sb-item-left">
                <span className={`roster-dot ${c.statusDot}`}></span>
                {c.name}
              </div>
              {c.id === activeClientId && <span className="roster-arrow">&gt;</span>}
            </div>
          ))
      )}

      {/* PENDING INTAKE */}
      <div className="sb-category">PENDING INTAKE</div>
      {loading ? (
        <>
          <div className="sb-item db-skeleton" style={{ margin: '8px 24px', height: '20px', borderRadius: '4px' }}></div>
          <div className="sb-item db-skeleton" style={{ margin: '8px 24px', height: '20px', borderRadius: '4px' }}></div>
        </>
      ) : (
        clients
          .filter(c => c.type === 'pending')
          .map(c => (
            <div
              key={c.id}
              className={`roster-item ${c.id === activeClientId ? 'active' : ''}`}
              onClick={() => onClientClick(c.id)}
            >
              <div className="sb-item-left">
                <span className="roster-dot gray"></span>
                {c.name}
              </div>
            </div>
          ))
      )}
    </aside>
  );
};

export default Sidebar;
