import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './dashboard.css';
import { initialClients, initialNotifications, initialChatMessages } from './dashboardData';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';

const DashboardLayout = () => {
  const navigate = useNavigate();

  // ─── Core data states ───────────────────────────────────────────────────────
  const [clients, setClients] = useState([]);
  const [activeClientId, setActiveClientId] = useState('quantum-logic');
  const [loading, setLoading] = useState(true);

  // ─── Panel / UI states ──────────────────────────────────────────────────────
  const [rightPanelTab, setRightPanelTab] = useState('intel');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ─── Notification & Bob chat states ─────────────────────────────────────────
  const [notificationsList, setNotificationsList] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isBobOpen, setIsBobOpen] = useState(false);

  // ─── Add Client modal states ─────────────────────────────────────────────────
  const [modalMethod, setModalMethod] = useState('link');
  const [linkCopied, setLinkCopied] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '', service: '', budget: '', deadline: '',
    type: 'active', statusDot: 'green', alertBadge: 'ready',
    alertDesc: 'Project set up complete'
  });

  // ─── Right-panel Task form states ────────────────────────────────────────────
  const [taskNameInput, setTaskNameInput] = useState('');
  const [taskHoursInput, setTaskHoursInput] = useState('');

  // ─── Simulated API load ──────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setClients(initialClients);
      setNotificationsList(initialNotifications);
      setChatMessages(initialChatMessages);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // ─── Derived values ──────────────────────────────────────────────────────────
  const activeClient = clients.find(c => c.id === activeClientId) || clients[0] || {};
  const activeClientsCount  = clients.filter(c => c.type === 'active').length;
  const pendingIntakeCount  = clients.filter(c => c.type === 'pending').length;
  const openApprovalsCount  = clients.filter(c => c.alertBadge === 'ready').length;
  const scopeFlagsCount     = clients.filter(c => c.statusDot === 'red').length;

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleToggleTask = (taskId) => {
    if (loading) return;
    setClients(prev => prev.map(c => {
      if (c.id !== activeClient.id) return c;
      const updatedTasks = c.tasks.map(t => {
        if (t.id !== taskId) return t;
        const done = !t.completed;
        return { ...t, completed: done, remaining: done ? 0 : t.hours };
      });
      const completedCount = updatedTasks.filter(t => t.completed).length;
      const progress = updatedTasks.length > 0
        ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
      return { ...c, tasks: updatedTasks, progress };
    }));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (loading || !taskNameInput.trim() || !taskHoursInput) return;
    setClients(prev => prev.map(c => {
      if (c.id !== activeClient.id) return c;
      const newTask = {
        id: Date.now(),
        text: taskNameInput.trim(),
        completed: false,
        hours: parseFloat(taskHoursInput),
        remaining: parseFloat(taskHoursInput)
      };
      const updatedTasks = [...(c.tasks || []), newTask];
      const completedCount = updatedTasks.filter(t => t.completed).length;
      const progress = updatedTasks.length > 0
        ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
      return { ...c, tasks: updatedTasks, progress };
    }));
    triggerToast(`Task "${taskNameInput}" added!`);
    setTaskNameInput('');
    setTaskHoursInput('');
  };

  const handleApproveIntake = (clientId) => {
    if (loading) return;
    setClients(prev => prev.map(c =>
      c.id !== clientId ? c : {
        ...c, type: 'active', statusDot: 'green', alertBadge: 'ready',
        alertDesc: 'Brief approved – phase 2 ready', progress: 25,
        sentiment: 90, sentimentLabel: 'Great', sentimentColor: 'green',
        priorityAction: 'Setup kickoff meeting with product owner.'
      }
    ));
    triggerToast(`${activeClient.name} moved to Active Roster!`);
    setNotificationsList(prev => [
      { id: Date.now(), text: `${activeClient.name} is now onboarded to Active Roster.`, read: false },
      ...prev
    ]);
  };

  const handleToggleBriefLock = () => {
    if (loading || !activeClient.id) return;
    const current = activeClient.briefLocked;
    setClients(prev => prev.map(c =>
      c.id !== activeClient.id ? c : { ...c, briefLocked: !current }
    ));
    triggerToast(!current ? 'Brief locked successfully!' : 'Brief unlocked!');
  };

  const handleCreateClient = (e) => {
    e.preventDefault();
    if (loading || !newClient.name) return;
    const clientId = newClient.name.toLowerCase().replace(/\s+/g, '-');
    const created = {
      ...newClient, id: clientId,
      sentiment: newClient.type === 'active' ? 90 : '—',
      sentimentLabel: newClient.type === 'active' ? 'Great' : 'Pending',
      sentimentColor: newClient.type === 'active' ? 'green' : 'yellow',
      progress: newClient.type === 'active' ? 20 : 0,
      priorityAction: newClient.type === 'active'
        ? `Review incoming onboarding deliverables for ${newClient.name}.`
        : 'Awaiting client intake questionnaire submission.',
      briefLocked: false, scopeCreepLog: [],
      tasks: [
        { id: 1, text: 'Confirm project scope & details', completed: false, hours: 2, remaining: 2 },
        { id: 2, text: 'Establish Slack / Communication group', completed: false, hours: 1, remaining: 1 }
      ],
      timeline: [
        { id: 1, date: 'May 23', title: 'Project Created', status: 'Active', progress: 50, active: true }
      ],
      chatLog: []
    };
    setClients(prev => [...prev, created]);
    setActiveClientId(clientId);
    setIsModalOpen(false);
    triggerToast(`Client "${newClient.name}" added successfully!`);
    navigate('/dashboard/clients');
    setNotificationsList(prev => [
      { id: Date.now(), text: `New client ${newClient.name} added.`, read: false },
      ...prev
    ]);
    setNewClient({
      name: '', service: '', budget: '', deadline: '',
      type: 'active', statusDot: 'green', alertBadge: 'ready',
      alertDesc: 'Project set up complete'
    });
  };

  const handleSendBobMessage = (e) => {
    e.preventDefault();
    if (loading || !chatInput.trim()) return;
    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setTimeout(() => {
      const q = userText.toLowerCase();
      let response = "I'm checking that. Let me look at your current roster for context.";
      if (q.includes('status') || q.includes('how is') || q.includes('report')) {
        response = `All looks steady. We have ${activeClientsCount} active clients. Quantum Logic requires attention, they have an urgent alert.`;
      } else if (q.includes('yes') || q.includes('nudge')) {
        response = "Drafting WhatsApp message: 'Hi team, Bob here. Just wanted to remind you to review our timeline request.' Link sent.";
        triggerToast('WhatsApp nudge sent successfully via Bob!');
      } else if (q.includes('nexus') || q.includes('core')) {
        response = "Nexus Core hasn't replied in 4 days. I flag this as a critical risk. You should escalate communication.";
      } else if (q.includes('apex') || q.includes('ventures')) {
        response = "Apex Ventures is green light. They approved the brief and Phase 2 is ready to proceed.";
      } else if (q.includes('help')) {
        response = "Commands: 'status' · 'nudge' · 'apex' · 'nexus'";
      }
      setChatMessages(prev => [...prev, { sender: 'bob', text: response }]);
    }, 800);
  };

  const handleClearNotifications = () => {
    setNotificationsList([]);
    setIsBellOpen(false);
    triggerToast('All notifications cleared');
  };

  const handleSidebarClientClick = (clientId) => {
    setActiveClientId(clientId);
    navigate('/dashboard/clients');
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="db-container">

      {/* TOPBAR */}
      <TopBar
        loading={loading}
        notificationsList={notificationsList}
        isBellOpen={isBellOpen}
        onBellClick={() => setIsBellOpen(!isBellOpen)}
        onCloseBell={() => setIsBellOpen(false)}
        onClearNotifications={handleClearNotifications}
        onAddClientClick={() => { setIsModalOpen(true); setModalMethod('link'); setLinkCopied(false); }}
      />

      {/* SIDEBAR */}
      <Sidebar
        clients={clients}
        activeClientId={activeClientId}
        pendingIntakeCount={pendingIntakeCount}
        loading={loading}
        onClientClick={handleSidebarClientClick}
      />

      {/* MAIN CONTENT OUTLET */}
      <div className="db-middle-panel" style={{ padding: 0 }}>
        <Outlet context={{
          clients, setClients,
          activeClientId, setActiveClientId,
          loading, triggerToast,
          notificationsList, setNotificationsList,
          chatMessages, setChatMessages,
          activeClient,
          activeClientsCount, pendingIntakeCount,
          openApprovalsCount, scopeFlagsCount
        }} />
      </div>

      {/* RIGHT PANEL */}
      <RightPanel
        loading={loading}
        activeClient={activeClient}
        rightPanelTab={rightPanelTab}
        setRightPanelTab={setRightPanelTab}
        taskNameInput={taskNameInput}
        setTaskNameInput={setTaskNameInput}
        taskHoursInput={taskHoursInput}
        setTaskHoursInput={setTaskHoursInput}
        onToggleTask={handleToggleTask}
        onAddTask={handleAddTask}
        onApproveIntake={handleApproveIntake}
        onToggleBriefLock={handleToggleBriefLock}
      />

      {/* ADD CLIENT MODAL — two method cards */}
      {isModalOpen && (
        <div className="db-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="add-modal" onClick={(e) => e.stopPropagation()}>

            <div className="db-modal-header">
              <h2>Add New Client</h2>
              <button className="db-modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            {/* Method selector cards */}
            <div className="method-cards">
              <button
                className={`method-card ${modalMethod === 'link' ? 'sel' : ''}`}
                onClick={() => { setModalMethod('link'); setLinkCopied(false); }}
                type="button"
              >
                <div className="mc-icon"><i className="ti ti-link"></i></div>
                <div className="mc-title">Send intake link</div>
                <div className="mc-desc">Generate a link and share it with the client to self-onboard</div>
              </button>

              <button
                className={`method-card ${modalMethod === 'manual' ? 'sel' : ''}`}
                onClick={() => setModalMethod('manual')}
                type="button"
              >
                <div className="mc-icon"><i className="ti ti-user-plus"></i></div>
                <div className="mc-title">Add manually</div>
                <div className="mc-desc">Fill in the client's details yourself and add to roster</div>
              </button>
            </div>

            {/* INTAKE LINK FLOW */}
            {modalMethod === 'link' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="link-box">
                  <span className="link-text">https://atsync.app/intake/dz-{Date.now().toString(36)}</span>
                  <button
                    className="copy-btn"
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('https://atsync.app/intake/dz-link');
                      setLinkCopied(true);
                      triggerToast('Intake link copied to clipboard!');
                      setTimeout(() => setLinkCopied(false), 2000);
                    }}
                  >
                    <i className="ti ti-copy"></i> {linkCopied ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>

                <div className="share-row">
                  <button className="share-btn" type="button" onClick={() => triggerToast('Opening email draft...')}>
                    <i className="ti ti-mail"></i> Email
                  </button>
                  <button className="share-btn" type="button" onClick={() => triggerToast('Opening WhatsApp share...')}>
                    <i className="ti ti-brand-whatsapp"></i> WhatsApp
                  </button>
                  <button className="share-btn" type="button" onClick={() => window.open('https://atsync.app/intake/link', '_blank')}>
                    <i className="ti ti-external-link"></i> Open
                  </button>
                </div>

                <div className="modal-footer">
                  <span className="footer-note">
                    <i className="ti ti-clock" style={{ color: 'var(--yellow)' }}></i> Link expires in 7 days
                  </span>
                  <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Close</button>
                </div>
              </div>
            )}

            {/* MANUAL ENTRY FLOW */}
            {modalMethod === 'manual' && (
              <form onSubmit={handleCreateClient}>
                <div className="field-grid">
                  <div className="field-group">
                    <label>Client name</label>
                    <input type="text" placeholder="e.g. Sarah J." value={newClient.name}
                      onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))} required />
                  </div>
                  <div className="field-group">
                    <label>Company</label>
                    <input type="text" placeholder="e.g. Kola Creatives" value={newClient.company || ''}
                      onChange={(e) => setNewClient(prev => ({ ...prev, company: e.target.value }))} />
                  </div>
                  <div className="field-group">
                    <label>Service type</label>
                    <input type="text" placeholder="e.g. Web Design" value={newClient.service}
                      onChange={(e) => setNewClient(prev => ({ ...prev, service: e.target.value }))} required />
                  </div>
                  <div className="field-group">
                    <label>Budget</label>
                    <input type="text" placeholder="e.g. $10,000" value={newClient.budget}
                      onChange={(e) => setNewClient(prev => ({ ...prev, budget: e.target.value }))} required />
                  </div>
                  <div className="field-group">
                    <label>Deadline</label>
                    <input type="text" placeholder="e.g. Aug 30" value={newClient.deadline}
                      onChange={(e) => setNewClient(prev => ({ ...prev, deadline: e.target.value }))} required />
                  </div>
                  <div className="field-group">
                    <label>Roster slot</label>
                    <select value={newClient.type} onChange={(e) => setNewClient(prev => ({ ...prev, type: e.target.value }))}>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer" style={{ marginTop: '12px' }}>
                  <span className="footer-note">
                    <i className="ti ti-check" style={{ color: 'var(--green)' }}></i> Added to roster immediately
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn-primary">Create Profile</button>
                  </div>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* BOB AI COMPANION CHAT */}
      {isBobOpen && (
        <div className="bob-chat-overlay">
          <div className="bob-chat-header">
            <span className="bob-chat-title">
              <i className="ti ti-robot" style={{ fontSize: '13px' }}></i> Bob AI Companion
            </span>
            <button className="bob-chat-close" onClick={() => setIsBobOpen(false)}>✕</button>
          </div>
          <div className="bob-chat-body">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.sender}`}>{msg.text}</div>
            ))}
          </div>
          <form className="bob-chat-input-area" onSubmit={handleSendBobMessage}>
            <input
              type="text"
              placeholder="Ask Bob something..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}

      {/* TOAST */}
      {toastMessage && (
        <div className="db-toast">
          <i className="ti ti-check" style={{ color: 'var(--cyan)' }}></i>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
