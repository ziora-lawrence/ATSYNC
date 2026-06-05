import React from 'react';

/**
 * Right panel component showing three tabs: Intel, Tasks, and Timeline.
 */
export const RightPanel = ({
  loading,
  activeClient = {},
  rightPanelTab,
  setRightPanelTab,
  taskNameInput,
  setTaskNameInput,
  taskHoursInput,
  setTaskHoursInput,
  onToggleTask,
  onAddTask,
  onApproveIntake,
  onToggleBriefLock,
}) => {
  const hasClient = activeClient && activeClient.id;

  const getSentimentClass = (color) => {
    if (color === 'green') return 'green';
    if (color === 'red') return 'red';
    return '';
  };

  const getProgressColorClass = (progress) => {
    if (progress < 30) return 'prog-fill-red';
    if (progress < 75) return 'prog-fill-amber';
    return '';
  };

  return (
    <aside className="db-right-panel">
      {/* Tab headers */}
      <div className="intel-tabs">
        <button
          className={`intel-tab ${rightPanelTab === 'intel' ? 'active' : ''}`}
          onClick={() => setRightPanelTab('intel')}
          type="button"
        >
          Intel
        </button>
        <button
          className={`intel-tab ${rightPanelTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setRightPanelTab('tasks')}
          type="button"
        >
          Tasks
        </button>
        <button
          className={`intel-tab ${rightPanelTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setRightPanelTab('timeline')}
          type="button"
        >
          Timeline
        </button>
      </div>

      {/* Tab body */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {!hasClient ? (
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '12px', textAlign: 'center' }}>
            No active client selected
          </div>
        ) : (
          <>
            {/* INTEL TAB */}
            {rightPanelTab === 'intel' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Sentiment */}
                <div className="intel-section">
                  <div className="intel-label">Client Sentiment</div>
                  <div className="sentiment-display">
                    <span className="sentiment-value">
                      {activeClient.sentiment}%
                    </span>
                    <span className={`sentiment-status ${getSentimentClass(activeClient.sentimentColor)}`}>
                      {activeClient.sentimentLabel}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="intel-section">
                  <div className="intel-label">Project Progress</div>
                  <div className="progress-labels">
                    <span>{activeClient.progress}%</span>
                    <span>{100 - activeClient.progress}% left</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-bar-fill ${getProgressColorClass(activeClient.progress)}`}
                      style={{ width: `${activeClient.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Priority action */}
                {activeClient.priorityAction && (
                  <div className="priority-card">
                    <div className="priority-title">Priority Action</div>
                    <div className="priority-desc">{activeClient.priorityAction}</div>
                  </div>
                )}

                {/* Client info table */}
                <div className="intel-section">
                  <div className="intel-label">Client Info</div>
                  <div className="client-info-table">
                    <div className="client-info-row">
                      <span className="info-label">Company</span>
                      <span className="info-value">{activeClient.company || activeClient.name}</span>
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
              </div>
            )}

            {/* TASKS TAB */}
            {rightPanelTab === 'tasks' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="intel-section">
                  <div className="intel-label">Add Task</div>
                  <form onSubmit={onAddTask} className="task-input-row">
                    <input
                      className="task-field"
                      placeholder="Task name e.g. Design homepage"
                      value={taskNameInput}
                      onChange={(e) => setTaskNameInput(e.target.value)}
                      required
                    />
                    <div className="task-add-row">
                      <input
                        className="task-time-field"
                        placeholder="Hours e.g. 4"
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={taskHoursInput}
                        onChange={(e) => setTaskHoursInput(e.target.value)}
                        required
                      />
                      <button className="add-task-btn" type="submit">
                        <i className="ti ti-plus"></i> Add task
                      </button>
                    </div>
                  </form>
                </div>

                <div className="intel-section">
                  <div className="intel-label">Task List</div>
                  <div className="tasks-list">
                    {(!activeClient.tasks || activeClient.tasks.length === 0) ? (
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center', padding: '10px 0' }}>
                        No tasks yet
                      </div>
                    ) : (
                      activeClient.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="task-item"
                          onClick={() => onToggleTask(task.id)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
                            <div className={`tcheck ${task.completed ? 'done' : ''}`}>
                              {task.completed && <i className="ti ti-check" style={{ fontSize: '9px' }}></i>}
                            </div>
                            <span className={`ttext ${task.completed ? 'done' : ''}`}>
                              {task.text}
                            </span>
                            <span className="ttime" style={{ marginLeft: 'auto', fontSize: '9px', color: task.completed ? 'var(--green)' : 'var(--text-secondary)' }}>
                              {task.completed ? 'Done' : `${task.remaining}h left`}
                            </span>
                          </div>
                          <div className="task-bar">
                            <div
                              className="task-bar-fill"
                              style={{
                                width: task.completed ? '100%' : `${((task.hours - task.remaining) / task.hours) * 100}%`,
                                backgroundColor: task.completed ? 'var(--green)' : 'var(--cyan)',
                              }}
                            ></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TIMELINE TAB */}
            {rightPanelTab === 'timeline' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="intel-section">
                  <div className="intel-label">Project Phases</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(!activeClient.timeline || activeClient.timeline.length === 0) ? (
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                        No timeline data
                      </div>
                    ) : (
                      activeClient.timeline.map((phase) => (
                        <div
                          key={phase.id}
                          className={`phase-card ${phase.active ? 'ap' : ''}`}
                          style={{ opacity: phase.active ? 1 : 0.5 }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span className="phase-name">{phase.title}</span>
                            <span className="badge bb">{phase.status}</span>
                          </div>
                          <div className="phase-date">{phase.date}</div>
                          {phase.active && phase.progress > 0 && (
                            <div className="prog-bar" style={{ marginTop: '7px' }}>
                              <div className="prog-fill" style={{ width: `${phase.progress}%` }}></div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="intel-section">
                  <div className="intel-label">Brief Lock</div>
                  <div className="brief-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#f1f5f9' }}>
                        {activeClient.name} Brief
                      </span>
                      <span className={`badge ${activeClient.briefLocked ? 'bg' : 'ba'}`}>
                        {activeClient.briefLocked ? 'Locked' : 'Unlocked'}
                      </span>
                    </div>

                    {activeClient.briefLocked ? (
                      <div style={{ fontSize: '10px', color: 'var(--yellow)', marginBottom: '8px' }}>
                        Change requests: 1 of 2 used
                      </div>
                    ) : (
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Ready to lock project scope
                      </div>
                    )}

                    {activeClient.scopeCreepLog && activeClient.scopeCreepLog.length > 0 && (
                      <>
                        <div className="intel-label" style={{ fontSize: '8px', marginTop: '8px' }}>
                          Scope Flags
                        </div>
                        {activeClient.scopeCreepLog.map((flag) => (
                          <div
                            key={flag.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '10px',
                              padding: '5px 0',
                              borderBottom: '0.5px solid #141c27',
                            }}
                          >
                            <span style={{ color: 'var(--text-secondary)', flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginRight: '6px' }}>
                              {flag.desc}
                            </span>
                            <span style={{ color: '#334155', fontSize: '9px' }}>
                              {flag.date}
                            </span>
                          </div>
                        ))}
                      </>
                    )}

                    <button
                      className="lock-btn"
                      onClick={onToggleBriefLock}
                      style={{
                        borderColor: activeClient.briefLocked ? 'var(--green)' : 'var(--yellow)',
                        color: activeClient.briefLocked ? 'var(--green)' : 'var(--yellow)',
                      }}
                      type="button"
                    >
                      <i className={`ti ${activeClient.briefLocked ? 'ti-lock' : 'ti-lock-open'}`}></i>
                      {activeClient.briefLocked ? 'Brief is locked' : 'Lock Brief'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

export default RightPanel;
