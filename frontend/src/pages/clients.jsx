import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import RightPanel from './RightPanel';

export const Clients = () => {
  const {
    clients = [],
    setClients,
    activeClient = {},
    setActiveClientId,
    loading,
    triggerToast,
    setNotificationsList,
    handleToggleTask,
    handleAddTask,
    handleApproveIntake,
    handleToggleBriefLock,
    setIsModalOpen,
    setModalMethod,
    sidebarOpen,
    setSidebarOpen
  } = useOutletContext();

  const [messageInput, setMessageInput] = useState('');
  const isMobile = () => window.innerWidth <= 768;
  const [colListCollapsed, setColListCollapsed] = useState(isMobile());
  const [rightPanelOpen, setRightPanelOpen] = useState(!isMobile());
  const [rightPanelTab, setRightPanelTab] = useState('intel');
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [approvalRequestText, setApprovalRequestText] = useState('');

  // Add Task overlay form state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskNameInput, setTaskNameInput] = useState('');
  const [taskInternalDeadline, setTaskInternalDeadline] = useState('');
  const [taskClientVisibleDate, setTaskClientVisibleDate] = useState('');
  const [taskDurationDays, setTaskDurationDays] = useState(3);
  const [taskPhase, setTaskPhase] = useState('');
  const [taskVisibleToClient, setTaskVisibleToClient] = useState(true);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeClient?.chatLog]);

  // Auto-resize chat input textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    }
  }, [messageInput]);

  const hasClient = activeClient && activeClient.id;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !hasClient) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: Date.now(),
      sender: 'agency',
      senderName: 'DANIEL',
      avatarInitials: 'DZ',
      text: messageInput.trim(),
      time: time,
    };

    // Update client chat log
    setClients(prev => prev.map(c => {
      if (c.id !== activeClient.id) return c;
      return {
        ...c,
        chatLog: [...(c.chatLog || []), userMsg]
      };
    }));

    const clientMsgText = messageInput.trim();
    setMessageInput('');

    // Simulate client response after 1.5 seconds
    setTimeout(() => {
      let clientResponseText = "Thanks for the update. Let me know when the next deliverable is ready for sign-off.";
      
      const lowerText = clientMsgText.toLowerCase();
      if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('budget')) {
        clientResponseText = `Yes, the budget of ${activeClient.budget} works for us. Let's make sure the deliverable covers all requirements.`;
      } else if (lowerText.includes('timeline') || lowerText.includes('schedule') || lowerText.includes('delay')) {
        clientResponseText = "Regarding the timeline: let's align on this at the next design sync.";
      } else if (lowerText.includes('approve') || lowerText.includes('sign off')) {
        clientResponseText = "Excellent. We will look out for the approval request banner and approve it on our end.";
      }

      const clientMsg = {
        id: Date.now() + 1,
        sender: 'client',
        senderName: activeClient.name.toUpperCase(),
        avatarInitials: activeClient.chatLog?.[0]?.avatarInitials || activeClient.name.split(' ').map(n => n[0]).join(''),
        text: clientResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setClients(prev => prev.map(c => {
        if (c.id !== activeClient.id) return c;
        return {
          ...c,
          chatLog: [...(c.chatLog || []), clientMsg]
        };
      }));
    }, 1500);
  };

  const handleOpenApprovalModal = () => {
    setApprovalRequestText(`Approval request for ${activeClient.service || 'deliverables'}`);
    setIsApprovalOpen(true);
  };

  const handleSendApproval = (e) => {
    e.preventDefault();
    if (!hasClient) return;

    // Update client status/alerts
    setClients(prev => prev.map(c => {
      if (c.id !== activeClient.id) return c;
      return {
        ...c,
        alertBadge: 'ready',
        alertDesc: approvalRequestText || 'Awaiting client approval request.',
        priorityAction: 'Awaiting client approval response on portal.'
      };
    }));

    // Trigger toast and notification
    triggerToast(`Approval request sent to ${activeClient.name}!`);
    setNotificationsList(prev => [
      { id: Date.now(), text: `Approval request sent to ${activeClient.name} for: "${approvalRequestText}"`, read: false },
      ...prev
    ]);

    setIsApprovalOpen(false);
  };

  const handleOpenAddTaskOverlay = (taskName) => {
    setTaskNameInput(taskName || '');
    const today = new Date().toISOString().split('T')[0];
    setTaskInternalDeadline(today);
    setTaskClientVisibleDate(today);
    setTaskDurationDays(3);
    const defaultPhase = activeClient.timeline?.find(p => p.active)?.title || activeClient.timeline?.[0]?.title || 'Design Review';
    setTaskPhase(defaultPhase);
    setTaskVisibleToClient(true);
    setIsAddTaskOpen(true);
  };

  const handleSaveTaskOverlay = (e) => {
    e.preventDefault();
    if (!taskNameInput.trim()) return;

    const newTask = {
      id: Date.now(),
      text: taskNameInput.trim(),
      completed: false,
      hours: parseFloat(taskDurationDays || 3) * 8,
      duration: parseInt(taskDurationDays) || 3,
      internalDeadline: taskInternalDeadline,
      clientVisibleDate: taskClientVisibleDate,
      phase: taskPhase,
      visibleToClient: taskVisibleToClient,
      overdue: false
    };

    setClients(prev => prev.map(c => {
      if (c.id !== activeClient.id) return c;
      const updatedTasks = [...(c.tasks || []), newTask];
      const completedCount = updatedTasks.filter(t => t.completed).length;
      const progress = updatedTasks.length > 0
        ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
      return { ...c, tasks: updatedTasks, progress };
    }));

    triggerToast(`Task "${taskNameInput.trim()}" added!`);
    setIsAddTaskOpen(false);
    setTaskNameInput('');
  };

  const handleAddPhase = (phaseName, phaseDate) => {
    if (!hasClient || !phaseName.trim()) return;

    // Format deadline date as short string like "Jun 28"
    let formattedDate = 'Jun 28';
    if (phaseDate) {
      const d = new Date(phaseDate);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } else {
      formattedDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    const newPhase = {
      id: Date.now(),
      title: phaseName.trim(),
      date: formattedDate,
      status: 'Pending',
      progress: 0,
      active: false
    };

    setClients(prev => prev.map(c => {
      if (c.id !== activeClient.id) return c;
      const updatedTimeline = [...(c.timeline || []), newPhase];
      return { ...c, timeline: updatedTimeline };
    }));

    triggerToast(`Phase "${phaseName}" added to timeline!`);
  };

  if (loading) {
    return (
      <div className="view" style={{ justifyContent: 'center', alignItems: 'center', color: 'var(--text-sec)' }}>
        <p>Loading client chat...</p>
      </div>
    );
  }

  const activeRoster = clients.filter(c => c.type === 'active');
  const pendingRoster = clients.filter(c => c.type === 'pending');

  const getDotClass = (dot) => {
    if (dot === 'orange') return 'amber';
    return dot || 'gray';
  };

  return (
    <div className="view" id="view-clients">

      {/* ── CLIENTS HEADER (always visible above panels) ── */}
      <div className="clients-header">
        <div className="chat-top-left">
          {/* Roster Toggle (left panel) */}
          <div
            className="list-tog"
            onClick={() => {
              const nextState = !colListCollapsed;
              setColListCollapsed(nextState);
              if (!nextState) setRightPanelOpen(false);
            }}
            title="Toggle client roster"
          >
            <i className="ti ti-users"></i>
          </div>

          {hasClient ? (
            <div>
              <div className="chat-cname">{activeClient.name}</div>
              <div className="chat-csub">
                {activeClient.service} · {activeClient.timeline?.find(t => t.active)?.title || 'Onboarding'} · Deadline: {activeClient.deadline}
              </div>
            </div>
          ) : (
            <div className="chat-cname">Select a Client</div>
          )}
        </div>

        <div className="chat-actions">
          {hasClient && (
            <>
              <button
                className="btn-outline danger"
                onClick={() => triggerToast('Logged change request scope flag.')}
              >
                <i className="ti ti-edit"></i> Request changes
              </button>
              <button
                className="btn-outline"
                onClick={() => window.open('https://calendly.com', '_blank')}
              >
                <i className="ti ti-phone"></i> Book call
              </button>
            </>
          )}

          {/* Utilities Panel Toggle (right panel) */}
          <div
            className="list-tog"
            onClick={() => {
              const nextState = !rightPanelOpen;
              setRightPanelOpen(nextState);
              if (nextState) setColListCollapsed(true);
            }}
            title="Toggle utilities panel"
          >
            <i className="ti ti-info-circle"></i>
          </div>
        </div>
      </div>

      {/* ── WORKSPACE (panels overlay only this area) ── */}
      <div className="workspace">

        {/* COLUMN 1: CLIENTS ROSTER */}
        <div className={`col-list ${colListCollapsed ? 'collapsed' : ''}`} id="col-list">
          <div className="col-list-head">
            <button className="add-cl-btn" onClick={() => { setIsModalOpen(true); setModalMethod('link'); }}>
              <i className="ti ti-plus"></i> Add client
            </button>
            <button className="col-list-close" onClick={() => setColListCollapsed(true)} title="Close roster">
              <i className="ti ti-x"></i>
            </button>
          </div>
          <div className="cl-scroll">
            {activeRoster.map((c) => (
              <div
                key={c.id}
                className={`cl-item ${activeClient.id === c.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveClientId(c.id);
                  if (isMobile()) setColListCollapsed(true);
                }}
              >
                <span className={`dot dot-${getDotClass(c.statusDot)}`}></span>
                {c.name}
              </div>
            ))}
          </div>
          <div className="intake-sec">
            <div className="intake-lbl">Pending intake</div>
            {pendingRoster.map((c) => (
              <div
                key={c.id}
                className={`cl-item ${activeClient.id === c.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveClientId(c.id);
                  if (isMobile()) setColListCollapsed(true);
                }}
              >
                <span className="dot dot-gray"></span>
                {c.name}
                <span className="intake-tag">Intake</span>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: CHAT BODY */}
        <div className="col-chat">
          {/* Approval Ribbon */}
          {hasClient && activeClient.type === 'active' && activeClient.alertBadge === 'ready' && (
            <div className="appr-ribbon">
              <div>
                <i className="ti ti-circle-check"></i> Delivery ready — {activeClient.budget} pending client approval
              </div>
              <button className="ribbon-btn" onClick={() => triggerToast('Approval request notification bumped.')}>
                Send for approval
              </button>
            </div>
          )}

          {/* Chat Messages Stream */}
          <div className="chat-stream">
            {!hasClient ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sec)', fontSize: '13px' }}>
                Select an active client from the roster to view communication
              </div>
            ) : (!activeClient.chatLog || activeClient.chatLog.length === 0) ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sec)', fontSize: '12px' }}>
                No message logs yet. Send a message to get started.
              </div>
            ) : (
              activeClient.chatLog.map((msg, idx) => {
                const isAgency = msg.sender === 'agency' || msg.sender === 'you';
                return (
                  <div key={msg.id || idx} className={`msg ${isAgency ? 'agency' : 'client'}`}>
                    <div className="msg-bub">{msg.text}</div>
                    <div className="msg-stamp">
                      {isAgency ? 'You' : msg.senderName} · {msg.time}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar */}
          {hasClient && (
            <form onSubmit={handleSendMessage} className="chat-input-bar">
              <textarea
                ref={textareaRef}
                className="chat-ta"
                placeholder={`Message ${activeClient.name}...`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button className="send-btn" type="submit">Send</button>
            </form>
          )}
        </div>

        {/* COLUMN 3: RIGHT PANEL (UTILITIES) */}
        {hasClient && (
          <div className={`col-right ${rightPanelOpen ? 'open' : 'collapsed'}`}>
            <RightPanel
              loading={loading}
              activeClient={activeClient}
              rightPanelTab={rightPanelTab}
              setRightPanelTab={setRightPanelTab}
              taskNameInput={taskNameInput}
              setTaskNameInput={setTaskNameInput}
              onToggleTask={handleToggleTask}
              onAddTask={handleOpenAddTaskOverlay}
              onApproveIntake={handleApproveIntake}
              onToggleBriefLock={handleToggleBriefLock}
              onAddPhase={handleAddPhase}
              setRightPanelOpen={setRightPanelOpen}
            />
          </div>
        )}

      </div>

      {/* ADD TASK OVERLAY */}
      {isAddTaskOpen && (
        <div className="db-modal-overlay" onClick={() => setIsAddTaskOpen(false)}>
          <form
            className="add-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveTaskOverlay}
            style={{ width: '480px', gap: '20px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>Add task</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-sec)' }}>Set deadlines, visibility, and duration for this task</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="overlay-label">Task name</label>
              <input
                type="text"
                className="overlay-input"
                placeholder="idk"
                value={taskNameInput}
                onChange={(e) => setTaskNameInput(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="overlay-label">Internal deadline</label>
                <input
                  type="date"
                  className="overlay-input"
                  value={taskInternalDeadline}
                  onChange={(e) => setTaskInternalDeadline(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="overlay-label">Client-visible date</label>
                <input
                  type="date"
                  className="overlay-input"
                  value={taskClientVisibleDate}
                  onChange={(e) => setTaskClientVisibleDate(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="overlay-label">Duration (days)</label>
                <input
                  type="number"
                  className="overlay-input"
                  value={taskDurationDays}
                  onChange={(e) => setTaskDurationDays(e.target.value)}
                  min="1"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="overlay-label">Phase</label>
                <select
                  className="overlay-input"
                  value={taskPhase}
                  onChange={(e) => setTaskPhase(e.target.value)}
                  required
                  style={{ background: '#18181D', border: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'pointer' }}
                >
                  {activeClient.timeline && activeClient.timeline.length > 0 ? (
                    activeClient.timeline.map((phase) => (
                      <option key={phase.id} value={phase.title}>{phase.title}</option>
                    ))
                  ) : (
                    <>
                      <option value="Onboarding">Onboarding</option>
                      <option value="Discovery">Discovery</option>
                      <option value="Design Review">Design Review</option>
                      <option value="Development">Development</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="toggle-box">
              <div className="toggle-box-text">
                <span className="toggle-box-title">Visible to client</span>
                <span className="toggle-box-subtitle">Client will see this task in their portal</span>
              </div>
              <div
                className={`toggle ${taskVisibleToClient ? '' : 'off'}`}
                onClick={() => setTaskVisibleToClient(!taskVisibleToClient)}
              ></div>
            </div>

            <div className="overlay-footer">
              <button
                type="button"
                className="btn-overlay-cancel"
                onClick={() => setIsAddTaskOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-overlay-action">
                Add task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Approval Modal */}
      {isApprovalOpen && (
        <div className="db-modal-overlay" onClick={() => setIsApprovalOpen(false)}>
          <form
            className="add-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSendApproval}
          >
            <div className="db-modal-header">
              <h2>Send approval request</h2>
              <button type="button" className="db-modal-close" onClick={() => setIsApprovalOpen(false)}>✕</button>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-sec)', lineHeight: 1.5 }}>
              Client will see a popup asking them to approve or reject. Price is locked once you send — you can't change it after.
            </p>
            <input
              className="form-input"
              placeholder="What are you requesting approval for? e.g. Final homepage design"
              value={approvalRequestText}
              onChange={(e) => setApprovalRequestText(e.target.value)}
              required
            />
            <div style={{ background: 'var(--bg-sub)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-ter)', fontWeight: 'bold' }}>AGREED PRICE</div>
                <div style={{ fontSize: '15px', color: '#fff', fontWeight: 'bold', marginTop: '2px' }}>{activeClient.budget}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-ter)', marginTop: '2px' }}>Locked at brief. Cannot be changed.</div>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-ter)', textAlign: 'right', lineHeight: 1.4 }}>
                1% platform fee
                <br />
                applied on payment
              </div>
            </div>
            <div className="modal-footer" style={{ marginTop: '6px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsApprovalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <i className="ti ti-send"></i> Send to client
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Clients;
