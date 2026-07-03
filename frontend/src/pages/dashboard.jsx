import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    clients = [],
    setActiveClientId,
    loading,
    activeClientsCount,
    openApprovalsCount,
  } = useOutletContext();

  const [expandedClientId, setExpandedClientId] = useState('madestone-fa'); // Default expand Madestone FA
  const [sortKey, setSortKey] = useState('urgency');

  const activeClients = clients.filter(c => c.type === 'active');

  const getDotClass = (dot) => {
    if (dot === 'orange') return 'amber';
    return dot || 'gray';
  };

  const getSentBadgeClass = (sentiment) => {
    if (sentiment < 60) return 'sent-low';
    if (sentiment < 80) return 'sent-ok';
    return 'sent-good';
  };

  const getTaskMiniDot = (task) => {
    if (task.completed) return 'dot-green';
    if (task.overdue) return 'dot-red';
    return 'dot-amber';
  };

  const handleCardClick = (clientId, e) => {
    // If clicking inside the task drawer or another interactive element, don't collapse
    if (e.target.closest('.task-drawer')) return;
    
    if (expandedClientId === clientId) {
      setExpandedClientId(null);
    } else {
      setExpandedClientId(clientId);
    }
  };

  const handleOpenClient = (clientId) => {
    setActiveClientId(clientId);
    navigate('/dashboard/clients');
  };

  // Sorting
  const sortedClients = [...activeClients].sort((a, b) => {
    if (sortKey === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortKey === 'progress') {
      return b.progress - a.progress;
    }
    // Default: Urgency based on sentiment score (lower is more urgent)
    const sentA = typeof a.sentiment === 'number' ? a.sentiment : 100;
    const sentB = typeof b.sentiment === 'number' ? b.sentiment : 100;
    return sentA - sentB;
  });

  // Calculate total tasks due this week
  const totalTasksCount = activeClients.reduce((acc, c) => acc + (c.tasks?.filter(t => !t.completed).length || 0), 0);
  const overdueTasksCount = activeClients.reduce((acc, c) => acc + (c.tasks?.filter(t => !t.completed && t.overdue).length || 0), 0);

  return (
    <div className="view" id="view-dashboard">
      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="mc accent">
          <div className="mc-label">Active clients</div>
          <div className="mc-val">{activeClientsCount}</div>
          <div className="mc-sub">2 need attention</div>
        </div>
        <div className="mc">
          <div className="mc-label">Tasks due this week</div>
          <div className="mc-val">{totalTasksCount}</div>
          <div className="mc-sub alert">{overdueTasksCount} overdue</div>
        </div>
        <div className="mc">
          <div className="mc-label">Pending approvals</div>
          <div className="mc-val">{openApprovalsCount}</div>
          <div className="mc-sub warn">₦180,000 gated</div>
        </div>
      </div>

      {/* Roster Section Header */}
      <div className="sec-header">
        <div className="sec-title">Clients</div>
        <select 
          className="sort-sel" 
          value={sortKey} 
          onChange={(e) => setSortKey(e.target.value)}
        >
          <option value="urgency">Sort by urgency</option>
          <option value="name">Sort by name</option>
          <option value="progress">Sort by progress</option>
        </select>
      </div>

      {/* Active Clients Cards */}
      <div>
        {loading ? (
          <div style={{ color: 'var(--text-sec)', fontSize: '13px' }}>Loading client cards...</div>
        ) : sortedClients.length === 0 ? (
          <div style={{ color: 'var(--text-sec)', fontSize: '13px' }}>No active roster clients found</div>
        ) : (
          sortedClients.map((c) => {
            const isExpanded = expandedClientId === c.id;
            return (
              <div 
                key={c.id} 
                className={`ccard ${isExpanded ? 'expanded' : ''} ${c.statusDot === 'red' ? 'urgent' : ''}`}
                onClick={(e) => handleCardClick(c.id, e)}
              >
                <div className="ccard-top">
                  <span className={`dot dot-${getDotClass(c.statusDot)}`}></span>
                  <div className="ccard-title">{c.name}</div>
                  <span className={`sent-badge ${getSentBadgeClass(c.sentiment)}`}>
                    {c.sentiment}
                  </span>
                  <i className="ti ti-chevron-down exp-icon"></i>
                </div>
                
                <div className="ccard-meta">
                  <div>Service: <span>{c.service}</span></div>
                  <div>Phase: <span>{c.timeline?.find(t => t.active)?.title || 'Onboarding'}</span></div>
                </div>

                <div className="prog-row">
                  <div className="prog-track">
                    <div 
                      className={`prog-fill ${c.sentiment < 60 ? 'red' : c.sentiment < 80 ? 'amb' : ''}`} 
                      style={{ width: `${c.progress}%` }}
                    ></div>
                  </div>
                  <div className="prog-label">
                    {c.tasks?.filter(t => t.completed).length || 0}/{c.tasks?.length || 0} tasks
                  </div>
                </div>

                {isExpanded && (
                  <div className="task-drawer">
                    {(c.tasks || []).map((t) => (
                      <div key={t.id} className={`task-mini ${t.overdue && !t.completed ? 'ov' : ''}`}>
                        <span className={`dot ${getTaskMiniDot(t)}`}></span>
                        {t.text}
                      </div>
                    ))}
                    <div style={{ marginTop: '10px', textAlign: 'right' }}>
                      <button 
                        className="btn-outline" 
                        onClick={() => handleOpenClient(c.id)}
                        type="button"
                      >
                        <i className="ti ti-brand-whatsapp"></i> Open Communication
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Dashboard;
