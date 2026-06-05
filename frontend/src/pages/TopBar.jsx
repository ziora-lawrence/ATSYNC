import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Top navigation bar – maintains visual parity with the existing "hacker‑terminal" theme.
 * Receives all props directly from DashboardLayout.
 */
export const TopBar = ({
  loading,
  notificationsList = [],
  isBellOpen,
  onBellClick,
  onClearNotifications,
  onAddClientClick,
}) => {
  const unreadCount = notificationsList.filter(n => !n.read).length;

  return (
    <header className="db-top-bar">
      <Link to="/dashboard" className="db-logo">
        ATSYNC
      </Link>

      <div className="db-actions">
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <div className="db-bell-wrapper" onClick={onBellClick}>
            <i className="ti ti-bell" style={{ fontSize: '18px' }}></i>
            {unreadCount > 0 && <span className="db-bell-badge"></span>}
          </div>

          {/* Bell Dropdown */}
          {isBellOpen && (
            <div
              style={{
                position: 'absolute',
                top: '30px',
                right: '0',
                width: '260px',
                backgroundColor: '#0a0f16',
                border: '0.5px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                  borderBottom: '0.5px solid var(--border-color)',
                  paddingBottom: '6px',
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  NOTIFICATIONS
                </span>
                {notificationsList.length > 0 && (
                  <button
                    onClick={onClearNotifications}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--cyan)',
                      fontSize: '9px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {notificationsList.length === 0 ? (
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', padding: '6px 0', textAlign: 'center' }}>
                  No new alerts
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                  {notificationsList.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        fontSize: '10px',
                        color: 'var(--text-primary)',
                        lineHeight: '1.4',
                        borderBottom: '0.5px dashed #141c27',
                        paddingBottom: '6px',
                      }}
                    >
                      {notif.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Client Button */}
        <button
          className="db-add-client-btn"
          onClick={onAddClientClick}
          disabled={loading}
          type="button"
        >
          <i className="ti ti-plus"></i> Add client
        </button>

        {/* User Avatar */}
        <div className="db-user-avatar">
          DZ
        </div>
      </div>
    </header>
  );
};

export default TopBar;
