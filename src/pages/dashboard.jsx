import React from 'react';
import { useOutletContext } from 'react-router-dom';
import './dashboard.css';

const Dashboard = () => {
  const {
    clients,
    setActiveClientId,
    loading,
    activeClientsCount,
    pendingIntakeCount,
    openApprovalsCount,
    scopeFlagsCount
  } = useOutletContext();

  return (
    <div className="db-middle-panel" style={{ height: '100%', overflowY: 'auto' }}>
      <section className="db-header">
        <h1>Dashboard</h1>
        <p>Your agency overview</p>
      </section>

      {/* Stats Grid */}
      <section className="db-stats-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div className="stat-card db-skeleton" key={idx} style={{ minHeight: '110px' }}>
              <div className="db-skeleton-text short"></div>
              <div className="db-skeleton-text" style={{ height: '28px', width: '50%' }}></div>
              <div className="db-skeleton-text short"></div>
            </div>
          ))
        ) : (
          <>
            <div className="stat-card">
              <span className="stat-card-label">Active Clients</span>
              <div className="stat-card-value">{activeClientsCount}</div>
              <span className="stat-card-subtext">+1 this month</span>
            </div>

            <div className="stat-card">
              <span className="stat-card-label">Pending Intake</span>
              <div className="stat-card-value">{pendingIntakeCount}</div>
              <span className="stat-card-subtext">Awaiting review</span>
            </div>

            <div className="stat-card">
              <span className="stat-card-label">Open Approvals</span>
              <div className="stat-card-value">
                {openApprovalsCount}
              </div>
              <span className="stat-card-subtext" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {clients.find(c => c.alertBadge === 'ready')?.name || 'None pending'}
              </span>
            </div>

            <div className="stat-card red-flag">
              <span className="stat-card-label">Scope Flags</span>
              <div className="stat-card-value red">{scopeFlagsCount}</div>
              <span className="stat-card-subtext">This week</span>
            </div>
          </>
        )}
      </section>

      {/* Alerts section */}
      <section>
        <div className="alerts-section-title">ALERTS</div>
        <div className="alerts-list">
          {loading ? (
            <>
              <div className="alert-row db-skeleton" style={{ height: '62px' }}>
                <div style={{ width: '60%' }}>
                  <div className="db-skeleton-text" style={{ width: '40%', height: '14px' }}></div>
                  <div className="db-skeleton-text long"></div>
                </div>
                <div className="db-skeleton-text" style={{ width: '60px', height: '20px', borderRadius: '4px' }}></div>
              </div>
              <div className="alert-row db-skeleton" style={{ height: '62px' }}>
                <div style={{ width: '60%' }}>
                  <div className="db-skeleton-text" style={{ width: '30%', height: '14px' }}></div>
                  <div className="db-skeleton-text long"></div>
                </div>
                <div className="db-skeleton-text" style={{ width: '60px', height: '20px', borderRadius: '4px' }}></div>
              </div>
            </>
          ) : (
            clients
              .filter(c => c.alertBadge !== null)
              .map(c => (
                <div
                  key={c.id}
                  className="alert-row"
                  onClick={() => setActiveClientId(c.id)}
                >
                  <div className="alert-info">
                    <span className="alert-company">{c.name}</span>
                    <span className="alert-desc">{c.alertDesc}</span>
                  </div>
                  <span className={`alert-badge ${c.alertBadge}`}>
                    {c.alertBadge}
                  </span>
                </div>
              ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
