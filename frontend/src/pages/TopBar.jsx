import React from 'react';

export const TopBar = ({
  loading,
  title,
  notificationsList = [],
  isBellOpen,
  onBellClick,
  onClearNotifications,
  sidebarOpen,
  setSidebarOpen,
  onSearchClick,
}) => {
  const unreadCount = notificationsList.filter(n => !n.read).length;

  return (
    <header className="topbar">
      {/* Hamburger Menu Toggle */}
      <div className="tb-ham" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <i className="ti ti-menu-2"></i>
      </div>

      {/* Dynamic Title */}
      <div className="tb-title" id="tb-title">
        {title}
      </div>

      {/* Action Buttons */}
      <div className="tb-right">
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <div className="tb-btn" onClick={onBellClick} title="Notifications">
            <i className="ti ti-bell"></i>
            {unreadCount > 0 && <span className="tb-bell-badge"></span>}
          </div>

          {/* Bell Dropdown */}
          {isBellOpen && (
            <div
              className="profile-dropdown"
              style={{
                position: 'absolute',
                top: '38px',
                right: '0',
                width: '260px',
                padding: '10px',
                zIndex: 1000,
                bottom: 'auto',
                left: 'auto',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '6px',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>
                  NOTIFICATIONS
                </span>
                {notificationsList.length > 0 && (
                  <button
                    onClick={onClearNotifications}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--ac-mid)',
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontFamily: 'inherit',
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {notificationsList.length === 0 ? (
                <div style={{ fontSize: '11px', color: 'var(--text-sec)', padding: '6px 0', textAlign: 'center' }}>
                  No new notifications
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                  {notificationsList.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        fontSize: '11.5px',
                        color: 'var(--text-sec)',
                        lineHeight: '1.4',
                        borderBottom: '1px dashed var(--border)',
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

        {/* Search Trigger */}
        <div className="tb-btn" title="Search" onClick={onSearchClick}>
          <i className="ti ti-search"></i>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
