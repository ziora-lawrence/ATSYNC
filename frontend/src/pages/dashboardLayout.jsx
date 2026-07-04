import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './dashboard.css';
import { initialClients, initialNotifications, initialChatMessages } from './dashboardData';
import { supabase } from '../lib/supabase';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ─── Core data states ───────────────────────────────────────────────────────
  // "clients" = demo/mock roster (dashboardData.js) — used by the overview page,
  // search overlay, sidebar, and the "Add Client" manual-entry flow.
  const [clients, setClients] = useState([]);
  // "realClients" = actual approved clients pulled from Supabase (agency_clients).
  // Fetched ONCE here, at the top of the tree, instead of separately inside
  // clients.jsx — that duplication is what caused activeClient to sometimes
  // resolve to a real client and sometimes silently fall back to mock data
  // depending on which screen you navigated in from.
  const [realClients, setRealClients] = useState([]);
  const [realClientsLoading, setRealClientsLoading] = useState(true);
  const [activeClientId, setActiveClientId] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Panel / UI states ──────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  const [_linkCopied, setLinkCopied] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '', company: '', email: '', phone: '', service: '', budget: '', deadline: '',
    type: 'active', statusDot: 'green', alertBadge: 'ready',
    alertDesc: 'Project set up complete'
  });

  // ─── Search overlay states ──────────────────────────────────────────────────
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Simulated demo-data load (mock roster only) ─────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const timer = setTimeout(() => {
      setClients(initialClients);
      setNotificationsList(initialNotifications);
      setChatMessages(initialChatMessages);
      setLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // ─── Real client load (Supabase) ─────────────────────────────────────────────
  // This is the single place real clients get fetched. clients.jsx reads
  // realClients from context instead of fetching its own copy, so there's
  // exactly one source of truth for "which real clients exist."
  useEffect(() => {
    const fetchRealClients = async () => {
      const user = JSON.parse(localStorage.getItem('atsync_user') || '{}');
      const agencyId = user.agencyId;

      if (!agencyId) {
        setRealClientsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('agency_clients')
        .select(`
          id,
          client_id,
          business_name,
          created_at,
          intake_submissions ( budget ),
          projects ( id, name, phase, progress, revisions_used, revisions_total, status )
        `)
        .eq('agency_id', agencyId)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching real clients:', error);
        setRealClientsLoading(false);
        return;
      }

      const shaped = (data || []).map((row) => {
        const project = Array.isArray(row.projects) ? row.projects[0] : row.projects;
        return {
          id: row.id, // agency_clients.id
          client_id: row.client_id,
          name: row.business_name || 'Client',
          type: 'active',
          statusDot: 'green',
          service: project?.name || 'New Project',
          budget: row.intake_submissions?.budget || '—',
          deadline: '—',
          progress: project?.progress || 0,
          alertBadge: null,
          timeline: project ? [{ id: 1, title: project.phase, active: true, status: 'Active', progress: project.progress, date: '—' }] : [],
          tasks: [],
          chatLog: [],
          scopeCreepLog: [],
          source: 'supabase',
          project: project || null,
          createdAt: row.created_at,
        };
      });

      setRealClients(shaped);
      setRealClientsLoading(false);
    };

    fetchRealClients();
  }, []);

  // ─── Derived values ──────────────────────────────────────────────────────────
  // activeClient always resolves against BOTH real and mock clients, no matter
  // which screen set activeClientId. This is what used to break: activeClient
  // was only ever looked up against the mock "clients" array, so a real
  // client's UUID never matched and it silently fell back to the first mock
  // client (Madestone FA) — which is why chat looked like it was replying
  // with dummy/canned messages instead of the real client's conversation.
  const allClients = [...realClients, ...clients];
  const activeClient = allClients.find(c => c.id === activeClientId) || {};

  // Auto-select a sensible default once data has loaded, instead of leaving
  // activeClientId pointing at nothing (or at a stale/dummy id) until the
  // user happens to click the right roster row.
  useEffect(() => {
    if (loading || realClientsLoading) return;
    if (activeClientId && allClients.some(c => c.id === activeClientId)) return;

    const firstReal = realClients[0];
    const firstMock = clients[0];
    const fallback = firstReal || firstMock;
    if (fallback) setActiveClientId(fallback.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, realClientsLoading, realClients, clients]);

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

  const handleAddTask = (taskName, hours) => {
    if (loading || !taskName.trim() || !hours) return;
    setClients(prev => prev.map(c => {
      if (c.id !== activeClient.id) return c;
      const newTask = {
        id: Date.now(),
        text: taskName.trim(),
        completed: false,
        hours: parseFloat(hours),
        remaining: parseFloat(hours)
      };
      const updatedTasks = [...(c.tasks || []), newTask];
      const completedCount = updatedTasks.filter(t => t.completed).length;
      const progress = updatedTasks.length > 0
        ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
      return { ...c, tasks: updatedTasks, progress };
    }));
    triggerToast(`Task "${taskName}" added!`);
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
      name: '', company: '', email: '', phone: '', service: '', budget: '', deadline: '',
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
        response = `All looks steady. We have ${activeClientsCount} active clients. Madestone FA requires attention.`;
      } else if (q.includes('yes') || q.includes('nudge')) {
        response = "Drafting WhatsApp message: 'Hi team, Bob here. Just wanted to remind you to review our timeline request.' Link sent.";
        triggerToast('WhatsApp nudge sent successfully via Bob!');
      } else if (q.includes('help')) {
        response = "Commands: 'status' · 'nudge'";
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

  // Determine view title dynamically
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/dashboard/clients')) return 'Clients';
    if (path.startsWith('/dashboard/payments')) return 'Payments';
    if (path.startsWith('/dashboard/intake')) return 'Intake Links';
    if (path.startsWith('/dashboard/bob')) return 'Bob (preview)';
    if (path.startsWith('/dashboard/marketplace')) return 'Marketplace';
    if (path.startsWith('/dashboard/settings')) return 'Settings';
    return 'ATSYNC';
  };

  return (
    <div className="shell">
      {/* SIDEBAR BACKDROP (mobile only) */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop visible"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}
      <Sidebar
        clients={clients}
        activeClientId={activeClientId}
        pendingIntakeCount={pendingIntakeCount}
        loading={loading}
        onClientClick={handleSidebarClientClick}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onAddClientClick={() => { setIsModalOpen(true); setModalMethod('link'); setLinkCopied(false); }}
      />

      {/* MAIN LAYOUT */}
      <div className="main-wrap">
        {/* TOPBAR */}
        <TopBar
          loading={loading}
          title={getPageTitle()}
          notificationsList={notificationsList}
          isBellOpen={isBellOpen}
          onBellClick={() => setIsBellOpen(!isBellOpen)}
          onCloseBell={() => setIsBellOpen(false)}
          onClearNotifications={handleClearNotifications}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onSearchClick={() => setIsSearchOpen(true)}
        />

        {/* OUTLET VIEW PORT */}
        <div className="view active" style={{ padding: 0 }}>
          <Outlet context={{
            clients, setClients,
            realClients, realClientsLoading,
            activeClientId, setActiveClientId,
            loading, triggerToast,
            notificationsList, setNotificationsList,
            chatMessages, setChatMessages,
            activeClient,
            activeClientsCount, pendingIntakeCount,
            openApprovalsCount, scopeFlagsCount,
            setIsBobOpen,
            handleToggleTask,
            handleAddTask,
            handleApproveIntake,
            handleToggleBriefLock,
            setIsModalOpen,
            setModalMethod,
            sidebarOpen,
            setSidebarOpen
          }} />
        </div>
      </div>

      {/* REDESIGNED ADD CLIENT MODAL */}
      {isModalOpen && (
        <div className="db-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="add-modal" onClick={(e) => e.stopPropagation()} style={{ width: '500px', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>Add a new client</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-sec)' }}>How do you want to bring this client in?</p>
            </div>

            {/* Method selector cards */}
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button
                className={`method-card ${modalMethod === 'link' ? 'sel' : ''}`}
                onClick={() => { setModalMethod('link'); setLinkCopied(false); }}
                type="button"
              >
                <div className="mc-icon"><i className="ti ti-link"></i></div>
                <div className="mc-title">Send intake link</div>
                <div className="mc-desc">Client fills a form themselves. Ideal for new leads.</div>
              </button>

              <button
                className={`method-card ${modalMethod === 'manual' ? 'sel' : ''}`}
                onClick={() => setModalMethod('manual')}
                type="button"
              >
                <div className="mc-icon"><i className="ti ti-pencil"></i></div>
                <div className="mc-title">Add manually</div>
                <div className="mc-desc">You fill in their details. Ideal for existing clients.</div>
              </button>
            </div>

            {/* INTAKE LINK FLOW */}
            {modalMethod === 'link' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const clientEmail = newClient.email || 'client@email.com';
                const clientName = clientEmail.split('@')[0];
                const clientId = 'pending-' + clientName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36);
                const created = {
                  id: clientId,
                  name: clientName.charAt(0).toUpperCase() + clientName.slice(1),
                  company: 'Pending Intake',
                  email: clientEmail,
                  type: 'pending',
                  statusDot: 'gray',
                  alertBadge: 'pending',
                  alertDesc: 'Awaiting questionnaire submission',
                  sentiment: '—',
                  sentimentLabel: 'Pending',
                  sentimentColor: 'yellow',
                  progress: 0,
                  budget: '₦120,000',
                  deadline: '2026-07-28',
                  service: 'Intake',
                  briefLocked: false,
                  priorityAction: 'Awaiting client intake form details.',
                  tasks: [
                    { id: 1, text: 'Confirm project scope & details', completed: false, hours: 2, remaining: 2 },
                    { id: 2, text: 'Establish Slack / Communication group', completed: false, hours: 1, remaining: 1 }
                  ],
                  timeline: [
                    { id: 1, date: 'Jun 28', title: 'Onboarding', status: 'Active', progress: 0, active: true }
                  ],
                  chatLog: [],
                  scopeCreepLog: []
                };
                setClients(prev => [...prev, created]);
                setActiveClientId(clientId);
                setIsModalOpen(false);
                triggerToast(`Intake client created for ${clientEmail}!`);
                navigate('/dashboard/clients');
                setNewClient({
                  name: '', company: '', email: '', phone: '', service: '', budget: '', deadline: '',
                  type: 'active', statusDot: 'green', alertBadge: 'ready',
                  alertDesc: 'Project set up complete'
                });
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="overlay-label">Client email</label>
                    <input
                      type="email"
                      className="overlay-input"
                      placeholder="client@email.com"
                      value={newClient.email || ''}
                      onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="overlay-label">Intake link to send</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        readOnly
                        value="atsync.io/intake/atlassync"
                        className="overlay-input"
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className="btn-overlay-action"
                        style={{ flex: 'none', background: 'var(--ac)' }}
                        onClick={() => {
                          navigator.clipboard.writeText('atsync.io/intake/atlassync');
                          triggerToast('Intake link copied!');
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overlay-footer">
                  <button type="button" className="btn-overlay-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-overlay-action">Add client</button>
                </div>
              </form>
            )}

            {/* MANUAL ENTRY FLOW */}
            {modalMethod === 'manual' && (
              <form onSubmit={handleCreateClient}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="overlay-label">Client name</label>
                    <input
                      type="text"
                      className="overlay-input"
                      placeholder="Adaeze Okonkwo"
                      value={newClient.name}
                      onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="overlay-label">Business name</label>
                    <input
                      type="text"
                      className="overlay-input"
                      placeholder="Madestone FA"
                      value={newClient.company || ''}
                      onChange={(e) => setNewClient(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="overlay-label">Email</label>
                    <input
                      type="email"
                      className="overlay-input"
                      placeholder="adaeze@madestone.com"
                      value={newClient.email || ''}
                      onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="overlay-label">Phone</label>
                    <input
                      type="text"
                      className="overlay-input"
                      placeholder="+234..."
                      value={newClient.phone || ''}
                      onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="overlay-label">Service</label>
                    <input
                      type="text"
                      className="overlay-input"
                      placeholder="Web Design + Branding"
                      value={newClient.service}
                      onChange={(e) => setNewClient(prev => ({ ...prev, service: e.target.value }))}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="overlay-label">Agreed value</label>
                    <input
                      type="text"
                      className="overlay-input"
                      placeholder="₦120,000"
                      value={newClient.budget}
                      onChange={(e) => setNewClient(prev => ({ ...prev, budget: e.target.value }))}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="overlay-label">Project deadline</label>
                    <input
                      type="date"
                      className="overlay-input"
                      value={newClient.deadline || ''}
                      onChange={(e) => setNewClient(prev => ({ ...prev, deadline: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="overlay-footer">
                  <button type="button" className="btn-overlay-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-overlay-action">Add client</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SEARCH OVERLAY */}
      {isSearchOpen && (
        <div className="search-overlay" onClick={() => setIsSearchOpen(false)}>
          <div className="search-container" onClick={(e) => e.stopPropagation()}>
            <div className="search-input-wrap">
              <i className="ti ti-search"></i>
              <input
                type="text"
                className="search-bar-input"
                placeholder="Search clients, pages, actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="search-results">
              <div className="search-section-title">Pages</div>
              {Object.entries({
                'Dashboard': '/dashboard',
                'Clients': '/dashboard/clients',
                'Payments': '/dashboard/payments',
                'Intake Links': '/dashboard/intake',
                'Bob AI (preview)': '/dashboard/bob',
                'Marketplace': '/dashboard/marketplace',
                'Settings': '/dashboard/settings'
              }).filter(([name]) => name.toLowerCase().includes(searchQuery.toLowerCase())).map(([name, path]) => (
                <div
                  key={path}
                  className="search-row-item"
                  onClick={() => {
                    navigate(path);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <i className="ti ti-layout-grid"></i>
                  {name}
                </div>
              ))}

              {clients.length > 0 && <div className="search-section-title" style={{ marginTop: '8px' }}>Clients</div>}
              {clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                <div
                  key={c.id}
                  className="search-row-item"
                  onClick={() => {
                    setActiveClientId(c.id);
                    navigate('/dashboard/clients');
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <i className="ti ti-user"></i>
                  {c.name} ({c.type === 'active' ? 'Active' : 'Pending'})
                </div>
              ))}

              {clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 &&
               Object.keys({
                 'Dashboard': 1, 'Clients': 1, 'Payments': 1, 'Intake Links': 1, 'Bob AI (preview)': 1, 'Marketplace': 1, 'Settings': 1
               }).filter(name => name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                 <div className="search-no-results">No matching results found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOB AI COMPANION CHAT */}
      {isBobOpen && (
        <div className="bob-chat-overlay">
          <div className="bob-chat-header">
            <span className="bob-chat-title">
              <i className="ti ti-robot"></i> Bob AI Companion
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
          <i className="ti ti-circle-check" style={{ color: 'var(--ac-mid)' }}></i>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
