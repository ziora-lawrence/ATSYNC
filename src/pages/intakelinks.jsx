import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

/**
 * IntakeLinks page – displays intake stats, recent client questionnaire submissions,
 * onboarding approvals, and a history log of scope creep flags.
 */
export const IntakeLinks = () => {
  const navigate = useNavigate();
  const {
    clients = [],
    setClients,
    loading,
    triggerToast,
    setNotificationsList,
    setActiveClientId,
  } = useOutletContext();

  const activeClients = clients.filter(c => c.type === 'active');
  const pendingClients = clients.filter(c => c.type === 'pending');

  const handleApprove = (client) => {
    setClients(prev => prev.map(c =>
      c.id !== client.id ? c : {
        ...c,
        type: 'active',
        statusDot: 'green',
        alertBadge: 'ready',
        alertDesc: 'Brief approved – phase 2 ready',
        progress: 25,
        sentiment: 90,
        sentimentLabel: 'Great',
        sentimentColor: 'green',
        priorityAction: 'Setup kickoff meeting with product owner.',
        tasks: [
          { id: 1, text: 'Confirm project scope & details', completed: false, hours: 2, remaining: 2 },
          { id: 2, text: 'Establish Slack / Communication group', completed: false, hours: 1, remaining: 1 }
        ],
        timeline: [
          { id: 1, date: 'Pending', title: 'Phase 1 — Onboarding', status: 'Active', progress: 50, active: true }
        ],
        chatLog: [
          {
            id: Date.now(),
            sender: 'bob',
            senderName: 'BOB AI',
            avatarInitials: 'B',
            text: `Welcome onboard ${client.name}! Let's start by reviewing the project specifications.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }
    ));

    triggerToast(`${client.name} moved to Active Roster!`);
    setNotificationsList(prev => [
      { id: Date.now(), text: `${client.name} is now onboarded to Active Roster.`, read: false },
      ...prev
    ]);

    // Redirect to the newly onboarded client's chat
    setActiveClientId(client.id);
    navigate('/dashboard/clients');
  };

  const handleSendToMarket = (leadName) => {
    triggerToast(`Lead "${leadName}" sent to the ATSYNC Marketplace!`);
    setNotificationsList(prev => [
      { id: Date.now(), text: `Lead "${leadName}" listed on the Agency Marketplace.`, read: false },
      ...prev
    ]);
  };

  // Compile all scope creep logs from active clients
  const allScopeLogs = clients.reduce((acc, c) => {
    if (c.scopeCreepLog && c.scopeCreepLog.length > 0) {
      c.scopeCreepLog.forEach(log => {
        acc.push({
          clientId: c.id,
          clientName: c.name,
          ...log
        });
      });
    }
    return acc;
  }, []);

  return (
    <div className="db-middle-panel" style={{ padding: '16px' }}>
      <div className="db-header">
        <h1>Intake Links</h1>
        <p>Submissions, responses, and scope creep logs</p>
      </div>

      {/* Stats cards */}
      <div className="db-stats-grid">
        <div className="stat-card">
          <div className="stat-card-label">LINKS SENT</div>
          <div className="stat-card-value">8</div>
          <div className="stat-card-subtext">Active links</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">SUBMITTED</div>
          <div className="stat-card-value">6</div>
          <div className="stat-card-subtext">75% submission rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">CONVERTED</div>
          <div className="stat-card-value">{activeClients.length}</div>
          <div className="stat-card-subtext">From intake</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">PENDING</div>
          <div className="stat-card-value">{pendingClients.length}</div>
          <div className="stat-card-subtext">Awaiting review</div>
        </div>
      </div>

      {/* Recent submissions table */}
      <div style={{ marginTop: '20px' }}>
        <div className="alerts-section-title">RECENT SUBMISSIONS</div>
        <div className="alerts-list">
          {/* Mock submissions + dynamic items */}
          {clients.map((c) => {
            const isPending = c.type === 'pending';
            const isActive = c.type === 'active';
            
            return (
              <div key={c.id} className="alert-row" style={{ cursor: 'default' }}>
                <div className="alert-info">
                  <div className="alert-company">{c.name}</div>
                  <div className="alert-desc">{c.service} · {c.budget} · {c.deadline}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`alert-badge ${isActive ? 'ready' : 'pending'}`}>
                    {isActive ? 'Active' : 'Pending'}
                  </span>
                  {isPending ? (
                    <button
                      className="row-btn"
                      onClick={() => handleApprove(c)}
                      style={{
                        borderColor: 'var(--cyan)',
                        color: 'var(--cyan)',
                        cursor: 'pointer',
                      }}
                      type="button"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      className="row-btn"
                      onClick={() => {
                        setActiveClientId(c.id);
                        navigate('/dashboard/clients');
                      }}
                      style={{ cursor: 'pointer' }}
                      type="button"
                    >
                      View
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Anon rejected lead */}
          <div className="alert-row" style={{ cursor: 'default' }}>
            <div className="alert-info">
              <div className="alert-company">Anon Lead</div>
              <div className="alert-desc">Ecommerce · ₦200k · Rejected due to low budget</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="alert-badge overdue">Rejected</span>
              <button
                className="row-btn"
                onClick={() => handleSendToMarket('Anon Lead (Ecommerce)')}
                style={{
                  borderColor: 'var(--yellow)',
                  color: 'var(--yellow)',
                  cursor: 'pointer',
                }}
                type="button"
              >
                Send to market
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scope creep log */}
      <div style={{ marginTop: '20px' }}>
        <div className="alerts-section-title">SCOPE CREEP LOG</div>
        <div className="alerts-list">
          {loading ? (
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Loading logs...</div>
          ) : allScopeLogs.length === 0 ? (
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>No scope creep flags reported</div>
          ) : (
            allScopeLogs.map((log, index) => {
              const isResolved = log.status === 'Resolved';
              return (
                <div key={index} className="alert-row" style={{ cursor: 'default' }}>
                  <div className="alert-info">
                    <div className="alert-company">{log.clientName}</div>
                    <div className="alert-desc">{log.desc}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>
                      {log.date}
                    </span>
                    <span className={`alert-badge ${isResolved ? 'ready' : 'overdue'}`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default IntakeLinks;
