import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

/**
 * Dashboard page – renders the main overview with statistics and active alerts.
 * Uses the context provided by DashboardLayout.
 */
export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    clients = [],
    activeClientsCount = 0,
    pendingIntakeCount = 0,
    openApprovalsCount = 0,
    scopeFlagsCount = 0,
    setActiveClientId,
    loading,
  } = useOutletContext();

  const activeClients = clients.filter(c => c.type === 'active');

  const getAlertBadgeClass = (badge) => {
    if (badge === 'warning') return 'urgent';
    if (badge === 'overdue') return 'overdue';
    if (badge === 'ready') return 'ready';
    return 'pending';
  };

  const getAlertBadgeLabel = (badge) => {
    if (badge === 'warning') return 'Urgent';
    if (badge === 'overdue') return 'Overdue';
    if (badge === 'ready') return 'Ready';
    return 'Pending';
  };

  const handleAlertClick = (clientId) => {
    setActiveClientId(clientId);
    navigate('/dashboard/clients');
  };

  const agencyName = (() => {
    try {
      return JSON.parse(localStorage.getItem('atsync_user'))?.agencyName || 'your agency';
    } catch {
      return 'your agency';
    }
  })();

  return (
    <div className="db-middle-panel" style={{ padding: '16px' }}>
      <div className="db-header">
        <h1>Welcome back{agencyName !== 'your agency' ? `, ${agencyName}` : ''}! 👋</h1>
        <p>Your agency overview</p>
      </div>

      {loading ? (
        <div className="db-stats-grid" style={{ opacity: 0.5 }}>
          <div className="stat-card"><div className="stat-card-label">LOADING STATS...</div></div>
          <div className="stat-card"><div className="stat-card-label">LOADING STATS...</div></div>
          <div className="stat-card"><div className="stat-card-label">LOADING STATS...</div></div>
          <div className="stat-card"><div className="stat-card-label">LOADING STATS...</div></div>
        </div>
      ) : (
        <div className="db-stats-grid">
          <div className="stat-card">
            <div className="stat-card-label">ACTIVE CLIENTS</div>
            <div className="stat-card-value">{activeClientsCount}</div>
            <div className="stat-card-subtext">+1 this month</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">PENDING INTAKE</div>
            <div className="stat-card-value">{pendingIntakeCount}</div>
            <div className="stat-card-subtext">Awaiting review</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">OPEN APPROVALS</div>
            <div className="stat-card-value">{openApprovalsCount}</div>
            <div className="stat-card-subtext">Quantum Logic</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">SCOPE FLAGS</div>
            <div className="stat-card-value red">{scopeFlagsCount}</div>
            <div className="stat-card-subtext">This week</div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <div className="alerts-section-title">ALERTS</div>
        <div className="alerts-list">
          {loading ? (
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Loading alerts...</div>
          ) : activeClients.length === 0 ? (
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>No active client alerts</div>
          ) : (
            activeClients.map((client) => (
              <div
                key={client.id}
                className="alert-row"
                onClick={() => handleAlertClick(client.id)}
              >
                <div className="alert-info">
                  <div className="alert-company">{client.name}</div>
                  <div className="alert-desc">{client.alertDesc || 'All clear'}</div>
                </div>
                <span className={`alert-badge ${getAlertBadgeClass(client.alertBadge)}`}>
                  {getAlertBadgeLabel(client.alertBadge)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

