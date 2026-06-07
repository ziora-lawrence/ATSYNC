import React, { useState } from 'react';

export const RightPanel = ({
  loading,
  activeClient = {},
  rightPanelTab,
  setRightPanelTab,
  taskNameInput,
  setTaskNameInput,
  onToggleTask,
  onAddTask,
  onApproveIntake,
  onToggleBriefLock,
  onAddPhase,
  setRightPanelOpen,
}) => {
  const hasClient = activeClient && activeClient.id;

  const [newPhaseName, setNewPhaseName] = useState('');
  const [newPhaseDate, setNewPhaseDate] = useState('');

  const getSentimentClass = (sentiment) => {
    if (sentiment < 60) return 'low';
    if (sentiment < 80) return 'ok';
    return 'good';
  };

  const getProgressColorClass = (sentiment) => {
    if (sentiment < 60) return 'red';
    if (sentiment < 80) return 'amb';
    return '';
  };

  return (
    <>
      {/* Tab headers */}
      <div className="util-tabs">
        <div 
          className={`ut ${rightPanelTab === 'intel' ? 'active' : ''}`}
          onClick={() => setRightPanelTab('intel')}
        >
          Intel
        </div>
        <div 
          className={`ut ${rightPanelTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setRightPanelTab('tasks')}
        >
          Tasks
        </div>
        <div 
          className={`ut ${rightPanelTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setRightPanelTab('timeline')}
        >
          Timeline
        </div>
        <div className="ut dim">Bob</div>
        {/* Mobile close button for right panel */}
        <button className="col-right-close" onClick={() => setRightPanelOpen(false)} title="Close panel">
          <i className="ti ti-x"></i>
        </button>
      </div>

      {/* Tab body */}
      <div className="util-body">
        {!hasClient ? (
          <div style={{ fontSize: '12px', color: 'var(--text-sec)', textAlign: 'center', padding: '20px 0' }}>
            No active client selected
          </div>
        ) : (
          <>
            {/* INTEL PANE */}
            <div className={`upane ${rightPanelTab === 'intel' ? 'active' : ''}`}>
              {/* Sentiment Score */}
              <div className="fld">
                <div className="fld-lbl">Sentiment score</div>
                <div className={`sent-big ${getSentimentClass(activeClient.sentiment)}`}>
                  {activeClient.sentiment || '—'}
                </div>
                {activeClient.sentiment < 60 ? (
                  <div style={{ fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>
                    ↓ Needs attention — overdue tasks
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--green)', marginTop: '4px' }}>
                    ↑ Healthy account standing
                  </div>
                )}
              </div>

              {/* Priority action */}
              {activeClient.priorityAction && (
                <div className="fld">
                  <div className="fld-lbl">Priority action</div>
                  <div className="prio-card">
                    <i className="ti ti-alert-triangle" style={{ marginRight: '6px' }}></i>
                    {activeClient.priorityAction}
                  </div>
                </div>
              )}

              {/* Client specifications */}
              <div className="fld">
                <div className="fld-lbl">Service</div>
                <div className="fld-val">{activeClient.service}</div>
              </div>
              <div className="fld">
                <div className="fld-lbl">Phase</div>
                <div className="fld-val">
                  {activeClient.timeline?.find(t => t.active)?.title || 'Onboarding'}
                </div>
              </div>
              <div className="fld">
                <div className="fld-lbl">Project deadline</div>
                <div className="fld-val">{activeClient.deadline}</div>
              </div>
              <div className="fld">
                <div className="fld-lbl">Agreed value</div>
                <div className="fld-val">{activeClient.budget}</div>
              </div>
            </div>

            {/* TASKS PANE */}
            <div className={`upane ${rightPanelTab === 'tasks' ? 'active' : ''}`}>
              <form 
                className="task-add-row" 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (taskNameInput.trim()) {
                    onAddTask(taskNameInput);
                  }
                }}
              >
                <input
                  className="task-inp"
                  type="text"
                  placeholder="Task name..."
                  value={taskNameInput}
                  onChange={(e) => setTaskNameInput(e.target.value)}
                  required
                />
                <button 
                  className="task-add-btn2" 
                  type="submit"
                  style={{
                    background: 'var(--ac)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <i className="ti ti-plus"></i>
                </button>
              </form>

              <div id="task-list">
                {(!activeClient.tasks || activeClient.tasks.length === 0) ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-sec)', textAlign: 'center', padding: '10px 0' }}>
                    No checklist items defined
                  </div>
                ) : (
                  activeClient.tasks.map((task) => (
                    <div key={task.id} className="task-item">
                      <div 
                        className={`check-circle ${task.completed ? 'done' : ''}`}
                        onClick={() => onToggleTask(task.id)}
                      ></div>
                      <div className="task-col">
                        <div className={`task-name-text ${task.completed ? 'done' : ''} ${task.overdue && !task.completed ? 'ov' : ''}`}>
                          {task.text}
                        </div>
                        <div className="task-prog-bar">
                          <div 
                            className="task-prog-fill" 
                            style={{ width: task.completed ? '100%' : '35%' }}
                          ></div>
                        </div>
                        <div className="task-meta-row">
                          <span className={`task-date ${task.overdue && !task.completed ? 'ov' : ''}`}>
                            {task.completed ? 'Approved' : task.overdue ? '2 days overdue' : 'Due tomorrow'}
                          </span>
                          <span className="task-vis">Public</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* TIMELINE PANE */}
            <div className={`upane ${rightPanelTab === 'timeline' ? 'active' : ''}`}>
              <div className="brief-row">
                <div className="brief-lbl">Brief locked</div>
                <div 
                  className={`toggle ${activeClient.briefLocked ? '' : 'off'}`}
                  onClick={onToggleBriefLock}
                ></div>
              </div>

              <div className="fld-lbl" style={{ marginBottom: '8px' }}>Project deadline</div>
              <input 
                type="date" 
                className="form-input" 
                style={{ fontSize: '12px', padding: '6px 10px', marginBottom: '14px' }} 
                value={activeClient.deadline?.includes('-') ? activeClient.deadline : '2026-06-28'} 
                readOnly
              />

              <div className="fld-lbl" style={{ marginBottom: '8px' }}>Project phases</div>
              <div className="phases-list">
                {(!activeClient.timeline || activeClient.timeline.length === 0) ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-sec)' }}>No phase list logged</div>
                ) : (
                  activeClient.timeline.map((phase, idx) => (
                    <div key={phase.id} className={`phase-node ${phase.active ? 'cur' : ''}`}>
                      <span className="ph-num">{idx + 1}</span>
                      {phase.title}
                      {phase.active && (
                        <span style={{ fontSize: '10px', opacity: 0.5, marginLeft: '4px' }}>← now</span>
                      )}
                      <span className="phase-deadline">{phase.date}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Add Project Phase Inline Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newPhaseName.trim()) return;
                  onAddPhase(newPhaseName, newPhaseDate);
                  setNewPhaseName('');
                  setNewPhaseDate('');
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginTop: '12px',
                  padding: '12px',
                  background: '#121216',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-sec)', letterSpacing: '0.05em' }}>ADD PHASE</div>
                <input
                  type="text"
                  className="overlay-input"
                  placeholder="Phase title (e.g. Design Review)"
                  style={{ fontSize: '11.5px', padding: '6px 10px' }}
                  value={newPhaseName}
                  onChange={(e) => setNewPhaseName(e.target.value)}
                  required
                />
                <input
                  type="date"
                  className="overlay-input"
                  style={{ fontSize: '11.5px', padding: '6px 10px' }}
                  value={newPhaseDate}
                  onChange={(e) => setNewPhaseDate(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="btn-overlay-action"
                  style={{ fontSize: '11.5px', padding: '6px', background: 'var(--ac)' }}
                >
                  Add phase
                </button>
              </form>

              <div className="fld-lbl" style={{ marginBottom: '6px' }}>Scope creep log</div>
              {activeClient.scopeCreepLog && activeClient.scopeCreepLog.length > 0 ? (
                activeClient.scopeCreepLog.map((flag) => (
                  <div key={flag.id} className="scope-pill">
                    <i className="ti ti-alert-triangle" style={{ marginRight: '6px' }}></i>
                    {flag.desc}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '11px', color: 'var(--text-ter)' }}>No scope flags raised.</div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default RightPanel;
