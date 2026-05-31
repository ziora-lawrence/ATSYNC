import React from 'react';

const RightPanel = ({
  loading,
  activeClient,
  rightPanelTab,
  setRightPanelTab,
  taskNameInput,
  setTaskNameInput,
  taskHoursInput,
  setTaskHoursInput,
  onToggleTask,
  onAddTask,
  onApproveIntake,
  onToggleBriefLock
}) => {
  return (
    <aside className="db-right-panel">
      {/* Tab nav */}
      <div className="intel-tabs">
        <button
          className={`intel-tab ${rightPanelTab === 'intel' ? 'active' : ''}`}
          onClick={() => setRightPanelTab('intel')}
        >
          Intel
        </button>
        <button
          className={`intel-tab ${rightPanelTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setRightPanelTab('tasks')}
        >
          Tasks
        </button>
        <button
          className={`intel-tab ${rightPanelTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setRightPanelTab('timeline')}
        >
          Timeline
        </button>
      </div>

      {loading ? (
        <div>
          <div className="intel-section">
            <div className="intel-label">Client Sentiment</div>
            <div className="db-skeleton" style={{ height: '32px', width: '120px', borderRadius: '4px' }}></div>
          </div>
          <div className="intel-section">
            <div className="intel-label">Phase 2 Progress</div>
            <div className="db-skeleton" style={{ height: '20px', width: '100%', borderRadius: '4px' }}></div>
          </div>
          <div className="intel-section">
            <div className="db-skeleton" style={{ height: '70px', width: '100%', borderRadius: '6px' }}></div>
          </div>
          <div className="intel-section">
            <div className="intel-label">Client Info</div>
            <div className="db-skeleton" style={{ height: '120px', width: '100%', borderRadius: '6px' }}></div>
          </div>
        </div>
      ) : (
        <>
          {/* ── INTEL TAB ── */}
          {rightPanelTab === 'intel' && (
            <div>
              {/* Sentiment */}
              <div className="intel-section">
                <div className="intel-label">Client Sentiment</div>
                <div className="sentiment-display">
                  <span className="sentiment-value">
                    {typeof activeClient.sentiment === 'number'
                      ? `${activeClient.sentiment}%`
                      : activeClient.sentiment}
                  </span>
                  <span className={`sentiment-status ${activeClient.sentimentColor || ''}`}>
                    {activeClient.sentimentLabel}{' '}
                    {activeClient.sentimentColor === 'green'
                      ? '↑'
                      : activeClient.sentimentColor === 'red'
                      ? '↓'
                      : '→'}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="intel-section">
                <div className="intel-label">Phase 2 Progress</div>
                <div className="progress-labels">
                  <span>{activeClient.progress}%</span>
                  <span>{100 - activeClient.progress}% left</span>
                </div>
                <div className="progress-track">
                  <div className="progress-bar-fill" style={{ width: `${activeClient.progress}%` }}></div>
                </div>
              </div>

              {/* Priority Action */}
              <div className="intel-section">
                <div className="priority-card">
                  <div className="priority-title">Priority Action</div>
                  <p className="priority-desc">{activeClient.priorityAction}</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="intel-section">
                <div className="intel-label">Client Info</div>
                <div className="client-info-table">
                  <div className="client-info-row">
                    <span className="info-label">Company</span>
                    <span className="info-value">{activeClient.name}</span>
                  </div>
                  <div className="client-info-row">
                    <span className="info-label">Budget</span>
                    <span className="info-value">{activeClient.budget}</span>
                  </div>
                  <div className="client-info-row">
                    <span className="info-label">Deadline</span>
                    <span className="info-value">{activeClient.deadline}</span>
                  </div>
                  <div className="client-info-row">
                    <span className="info-label">Service</span>
                    <span className="info-value">{activeClient.service}</span>
                  </div>
                </div>
              </div>

              {/* Approve pending client */}
              {activeClient.type === 'pending' && (
                <div className="intel-section" style={{ marginTop: '16px' }}>
                  <button
                    className="btn-primary"
                    style={{ width: '100%', padding: '12px' }}
                    onClick={() => onApproveIntake(activeClient.id)}
                  >
                    Approve Client Intake
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── TASKS TAB ── */}
          {rightPanelTab === 'tasks' && (
            <div>
              <div className="intel-label" style={{ marginBottom: '8px' }}>Add Task</div>
              <form onSubmit={onAddTask} className="task-input-row" style={{ marginBottom: '16px' }}>
                <input
                  className="task-field"
                  type="text"
                  placeholder="Task name e.g. Design homepage"
                  value={taskNameInput}
                  onChange={(e) => setTaskNameInput(e.target.value)}
                  required
                />
                <div className="task-add-row" style={{ marginTop: '6px' }}>
                  <input
                    className="task-time-field"
                    type="number"
                    placeholder="Hours e.g. 4"
                    min="0.5"
                    step="0.5"
                    value={taskHoursInput}
                    onChange={(e) => setTaskHoursInput(e.target.value)}
                    required
                  />
                  <button type="submit" className="add-task-btn">
                    <i className="ti ti-plus"></i> Add task
                  </button>
                </div>
              </form>

              <div className="intel-label" style={{ marginBottom: '12px' }}>Task List</div>
              <div className="tasks-list">
                {activeClient.tasks && activeClient.tasks.length > 0 ? (
                  activeClient.tasks.map(t => (
                    <div
                      key={t.id}
                      className={`task-item ${t.completed ? 'completed' : ''}`}
                      onClick={() => onToggleTask(t.id)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '4px' }}
                    >
                      <div className="task-top" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <div className={`tcheck ${t.completed ? 'done' : ''}`} style={{ marginRight: '6px' }}>
                          {t.completed && <i className="ti ti-check" style={{ fontSize: '9px' }}></i>}
                        </div>
                        <span className={`ttext ${t.completed ? 'done' : ''}`} style={{ flex: 1 }}>{t.text}</span>
                        <span className="ttime" style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>
                          {t.completed ? 'Done' : `${t.remaining}h left`}
                        </span>
                      </div>
                      <div className="task-bar" style={{ marginTop: '2px' }}>
                        <div
                          className="task-bar-fill"
                          style={{
                            width: `${t.completed ? 100 : Math.round(((t.hours - t.remaining) / t.hours) * 100)}%`,
                            backgroundColor: t.completed
                              ? 'var(--green)'
                              : t.remaining < t.hours / 2
                              ? 'var(--yellow)'
                              : 'var(--cyan)'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center', marginTop: '20px' }}>
                    No tasks assigned.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TIMELINE TAB ── */}
          {rightPanelTab === 'timeline' && (
            <div>
              <div className="intel-label" style={{ marginBottom: '12px' }}>Project Phases</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {activeClient.timeline && activeClient.timeline.length > 0 ? (
                  activeClient.timeline.map((m, index) => (
                    <div
                      key={m.id || index}
                      className={`phase-card ${m.active ? 'ap' : ''}`}
                      style={{ opacity: m.active ? 1 : 0.5 }}
                    >
                      <div className="phase-top" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="phase-name" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {m.title}
                        </span>
                        <span
                          className={`badge ${m.status === 'Done' ? 'bg' : m.status === 'Pending' ? 'hbtn-ghost' : 'bb'}`}
                          style={{ fontSize: '8px' }}
                        >
                          {m.status}
                        </span>
                      </div>
                      <div className="phase-date" style={{ fontSize: '8px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {m.date}
                      </div>
                      {m.active && (
                        <div className="prog-bar" style={{ marginTop: '6px' }}>
                          <div className="prog-fill" style={{ width: `${m.progress}%` }}></div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center' }}>
                    No phases configured.
                  </div>
                )}
              </div>

              {/* Brief Lock */}
              <div className="intel-label" style={{ marginBottom: '8px' }}>Brief Lock</div>
              <div
                className="brief-box"
                style={{ padding: '10px', backgroundColor: 'var(--card-bg)', border: '1px solid #131920', borderRadius: '6px' }}
              >
                <div
                  className="brief-top"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}
                >
                  <span className="brief-title" style={{ fontSize: '0.72rem', fontWeight: 'bold' }}>
                    {activeClient.name} Brief
                  </span>
                  <span className={`badge ${activeClient.briefLocked ? 'bg' : 'br'}`} style={{ fontSize: '8px' }}>
                    {activeClient.briefLocked ? 'Locked' : 'Unlocked'}
                  </span>
                </div>

                <div className="brief-counter" style={{ fontSize: '9px', color: 'var(--yellow)', marginBottom: '8px' }}>
                  Change requests: {activeClient.briefLocked ? '1 of 2 used' : 'Unlimited active'}
                </div>

                <div className="intel-label" style={{ fontSize: '8px', marginBottom: '6px' }}>Scope Flags</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {activeClient.scopeCreepLog && activeClient.scopeCreepLog.length > 0 ? (
                    activeClient.scopeCreepLog.map(l => (
                      <div
                        key={l.id}
                        className="bc-item"
                        style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', padding: '4px 0', borderBottom: '1px solid #1a222e' }}
                      >
                        <span
                          className="bc-desc"
                          style={{ color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '130px' }}
                        >
                          {l.desc}
                        </span>
                        <span className="bc-date" style={{ color: '#475569' }}>{l.date}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '8px', color: 'var(--text-secondary)' }}>No flagged changes.</div>
                  )}
                </div>

                <button className="lock-btn" onClick={onToggleBriefLock} style={{ width: '100%', marginTop: '10px' }}>
                  <i className={activeClient.briefLocked ? 'ti ti-lock-open' : 'ti ti-lock'}></i>{' '}
                  {activeClient.briefLocked ? 'Unlock brief' : 'Lock brief'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </aside>
  );
};

export default RightPanel;
