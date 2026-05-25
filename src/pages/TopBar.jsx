import React from 'react';
import { Link } from 'react-router-dom';

const TopBar = ({
  loading,
  notificationsList,
  isBellOpen,
  onBellClick,
  onClearNotifications,
  onAddClientClick,
  onCloseBell
}) => {
  return (
    <header className="db-top-bar">
      <Link to="/dashboard" className="db-logo">
        ATSYNC
      </Link>

      <div className="db-actions">
        {/* Notification bell */}
        <div className="db-bell-wrapper" onClick={() => !loading && onBellClick()}>
          <i className="ti ti-bell" style={{ fontSize: '18px' }}></i>
          {!loading && notificationsList.length > 0 && <span className="db-bell-badge"></span>}

          {!loading && isBellOpen && (
            <div
              className="bob-chat-overlay"
              style={{ bottom: 'auto', top: '55px', right: '55px', height: '240px', width: '280px' }}
            >
              <div className="bob-chat-header">
                <span className="bob-chat-title">Notifications</span>
                <button
                  className="bob-chat-close"
                  onClick={(e) => { e.stopPropagation(); onCloseBell(); }}
                >
                  ✕
                </button>
              </div>

              <div className="bob-chat-body">
                {notificationsList.length === 0 ? (
                  <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>
                    No updates.
                  </div>
                ) : (
                  notificationsList.map(n => (
                    <div
                      key={n.id}
                      style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', fontSize: '0.7rem' }}
                    >
                      {n.text}
                    </div>
                  ))
                )}
              </div>

              {notificationsList.length > 0 && (
                <div style={{ padding: '8px', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    className="btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.65rem', width: '100%' }}
                    onClick={onClearNotifications}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Client Button */}
        <button
          className="db-add-client-btn"
          onClick={() => !loading && onAddClientClick()}
          disabled={loading}
        >
          <i className="ti ti-plus" style={{ fontSize: '12px' }}></i> Add client
        </button>

        {/* User profile avatar */}
        <div className="db-user-avatar" title="Daniel Ziora">
          DZ
        </div>
      </div>
    </header>
  );
};

export default TopBar;
