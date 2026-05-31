import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { initialIntakeStats, initialIntakeSubmissions } from './dashboardData';
import './dashboard.css';

const IntakeLinks = () => {
  const navigate = useNavigate();
  const { clients, setActiveClientId, triggerToast } = useOutletContext();
  
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setSubmissions(initialIntakeSubmissions);
      setStats(initialIntakeStats);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Dynamically aggregate scope creep logs across active client rosters
  const scopeCreepLog = clients.flatMap(c => 
    (c.scopeCreepLog || []).map(log => ({
      clientId: c.id,
      clientName: c.name,
      ...log
    }))
  );

  const handleActionClick = (clientName) => {
    // Attempt to map intake submission to a client roster item
    const matched = clients.find(c => c.name.toLowerCase().includes(clientName.toLowerCase()) || clientName.toLowerCase().includes(c.name.toLowerCase()));
    if (matched) {
      setActiveClientId(matched.id);
      navigate('/dashboard/clients');
      triggerToast(`Navigated to chat view for ${matched.name}`);
    } else {
      triggerToast(`Opening questionnaire details for ${clientName}`);
    }
  };

  return (
    <div className="db-middle-panel" style={{ height: '100%', overflowY: 'auto' }}>
      <section className="db-header">
        <h1>Intake Links</h1>
        <p>Submissions, responses, and scope creep logs</p>
      </section>

      {/* Intake Stats */}
      <section className="db-stats-grid" style={{ marginBottom: '28px' }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div className="stat-card db-skeleton" key={idx} style={{ minHeight: '90px' }}>
              <div className="db-skeleton-text short"></div>
              <div className="db-skeleton-text" style={{ height: '24px', width: '40%' }}></div>
            </div>
          ))
        ) : (
          <>
            <div className="stat-card">
              <span className="stat-card-label">Links Sent</span>
              <div className="stat-card-value">{stats.linksSent}</div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Submitted</span>
              <div className="stat-card-value">{stats.submitted}</div>
              <span className="stat-card-subtext">75% conversion rate</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Converted</span>
              <div className="stat-card-value">{stats.converted}</div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Pending</span>
              <div className="stat-card-value">{stats.pending}</div>
            </div>
          </>
        )}
      </section>

      {/* Submissions list */}
      <section style={{ marginBottom: '28px' }}>
        <div className="alerts-section-title">RECENT SUBMISSIONS</div>
        <div className="alerts-list">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div className="alert-row db-skeleton" key={idx} style={{ height: '55px' }}>
                <div style={{ width: '70%' }}>
                  <div className="db-skeleton-text" style={{ width: '45%' }}></div>
                  <div className="db-skeleton-text long"></div>
                </div>
              </div>
            ))
          ) : submissions.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', padding: '20px' }}>
              No link submissions registered.
            </div>
          ) : (
            submissions.map(sub => (
              <div key={sub.id} className="alert-row" style={{ padding: '12px 18px' }}>
                <div className="alert-info">
                  <span className="alert-company">{sub.client} — {sub.name}</span>
                  <span className="alert-desc" style={{ fontSize: '0.7rem' }}>
                    {sub.service} · Budget: {sub.budget} · Date: {sub.date}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`alert-badge ${sub.status === 'Active' ? 'ready' : sub.status === 'Pending' ? 'urgent' : 'overdue'}`}>
                    {sub.status}
                  </span>
                  <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => handleActionClick(sub.client)}>
                    {sub.status === 'Pending' ? 'Review' : 'View answers'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Scope Creep Log */}
      <section>
        <div className="alerts-section-title">SCOPE CREEP LOG</div>
        <div className="alerts-list">
          {loading ? (
            Array.from({ length: 2 }).map((_, idx) => (
              <div className="alert-row db-skeleton" key={idx} style={{ height: '50px' }}>
                <div className="db-skeleton-text" style={{ width: '60%' }}></div>
              </div>
            ))
          ) : scopeCreepLog.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', padding: '20px' }}>
              No scope creep occurrences logged.
            </div>
          ) : (
            scopeCreepLog.map(log => (
              <div key={log.id} className="alert-row" style={{ padding: '12px 18px' }}>
                <div className="alert-info">
                  <span className="alert-company" style={{ fontSize: '0.85rem' }}>{log.clientName}</span>
                  <span className="alert-desc" style={{ fontSize: '0.72rem' }}>{log.desc}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="alert-desc" style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{log.date}</span>
                  <span className={`alert-badge ${log.status === 'Resolved' ? 'ready' : 'overdue'}`}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default IntakeLinks;
