import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './clientportal.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://atsync-backend.onrender.com';

// ── Agency Profile Modal ──────────────────────────────────────
const AgencyModal = ({ agency, onClose }) => (
  <div className="cp-modal-backdrop" onClick={onClose}>
    <div className="cp-modal" onClick={e => e.stopPropagation()}>
      <button className="cp-modal-close" onClick={onClose}>
        <i className="ti ti-x"></i>
      </button>
      <div className="cp-modal-avatar" style={{ background: agency.color }}>
        {agency.initials}
      </div>
      <div className="cp-modal-name">{agency.name}</div>
      <div className="cp-modal-tag">{agency.tagline}</div>
      {agency.location && (
        <div className="cp-modal-location">
          <i className="ti ti-map-pin"></i> {agency.location}
        </div>
      )}
    </div>
  </div>
);

// ── Client Profile Modal ──────────────────────────────────────
const ClientProfileModal = ({ client, onClose }) => {
  const [name, setName] = useState(client?.user_metadata?.full_name || '');
  const [saveState, setSaveState] = useState('idle');

  const handleSave = async () => {
    setSaveState('saving');
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    if (error) { setSaveState('error'); return; }
    setSaveState('saved');
  };

  return (
    <div className="cp-modal-backdrop" onClick={onClose}>
      <div className="cp-modal" onClick={e => e.stopPropagation()}>
        <button className="cp-modal-close" onClick={onClose}>
          <i className="ti ti-x"></i>
        </button>
        <div className="cp-modal-avatar" style={{ background: '#6C47FF' }}>
          {getInitials(name || client?.email?.split('@')[0] || '?')}
        </div>
        <div className="cp-modal-name">{name || 'Your name'}</div>
        <div className="cp-modal-tag">{client?.email}</div>
        <div className="cp-profile-field">
          <label htmlFor="cp-profile-name">Full name</label>
          <input
            id="cp-profile-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        {saveState === 'error' && <div className="cp-profile-error">Couldn't save — try again.</div>}
        {saveState === 'saved' && <div className="cp-profile-saved">Saved!</div>}
        <button className="cp-profile-save" onClick={handleSave} disabled={saveState === 'saving'}>
          {saveState === 'saving' ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};

// ── Avatar Popup ──────────────────────────────────────────────
const AvatarPopup = ({ onViewProfile, onSettings }) => (
  <div className="cp-avatar-popup">
    <div className="cp-avatar-popup-item" onClick={onViewProfile}>
      <i className="ti ti-user"></i> View Profile
    </div>
    <div className="cp-avatar-popup-item" onClick={onSettings}>
      <i className="ti ti-settings-2"></i> Settings
    </div>
  </div>
);

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const AGENCY_COLORS = ['#6C47FF', '#0ea5e9', '#1D9E75', '#f59e0b', '#ec4899'];

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const fmtAmount = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return '—';
  return `₦${num.toLocaleString()}`;
};

// ── Main Component ────────────────────────────────────────────
const ClientPortal = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();

  const [client, setClient] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [selectedAgencyClientId, setSelectedAgencyClientId] = useState(null);
  const [message, setMessage] = useState('');
  const isMobile = () => window.innerWidth <= 768;
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(isMobile());
  const [rightPanelOpen, setRightPanelOpen] = useState(!isMobile());
  const [agencyModal, setAgencyModal] = useState(null);
  const [profileModal, setProfileModal] = useState(false);
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [changeTitle, setChangeTitle] = useState('');
  const [changeDesc, setChangeDesc] = useState('');
  const [avatarPopup, setAvatarPopup] = useState(false);
  const [loadState, setLoadState] = useState('loading');

  // ── Chat state ──
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  // ── Fetch user + agencies ──
  useEffect(() => {
    const fetchData = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) { setLoadState('error'); return; }
      setClient(userData.user);

      const { data, error } = await supabase
        .from('agency_clients')
        .select(`
          id,
          agency_id,
          business_name,
          profiles!agency_clients_agency_id_fkey ( agency_name, tagline, location ),
          projects ( id, name, phase, progress, revisions_used, revisions_total, status ),
          approvals ( id, type, title, description, amount, status, requested_at, payments ( status ) )
        `)
        .eq('client_id', userData.user.id);

      if (error) { setLoadState('error'); return; }
      if (!data || data.length === 0) { setLoadState('empty'); return; }

      const shaped = data.map((row, idx) => {
        const agencyName = row.profiles?.agency_name || row.business_name || 'Agency';
        const project = Array.isArray(row.projects) ? row.projects[0] : row.projects;
        const approvalsList = Array.isArray(row.approvals) ? row.approvals : [];
        return {
          id: row.id,
          agency_id: row.agency_id,
          name: agencyName,
          initials: getInitials(agencyName),
          color: AGENCY_COLORS[idx % AGENCY_COLORS.length],
          tagline: row.profiles?.tagline || '',
          location: row.profiles?.location || '',
          project: project
            ? {
                id: project.id,
                name: project.name,
                phase: project.phase,
                progress: project.progress,
                revisionsUsed: project.revisions_used,
                revisionsTotal: project.revisions_total,
                status: project.status,
                tasks: [],
                approvals: approvalsList,
                invoice: null,
              }
            : {
                id: null,
                name: 'No project yet',
                phase: 'Pending',
                progress: 0,
                revisionsUsed: 0,
                revisionsTotal: 0,
                status: 'pending',
                tasks: [],
                approvals: approvalsList,
                invoice: null,
              },
        };
      });

      setAgencies(shaped);
      setSelectedAgencyClientId(shaped[0].id);
      setLoadState('ready');
    };

    fetchData();
  }, [clientId]);

  // ── Refetch just the approvals for the current conversation (used after approve/pay/webhook) ──
  const refetchApprovals = async () => {
    if (!selectedAgencyClientId) return;
    const { data, error } = await supabase
      .from('approvals')
      .select('id, type, title, description, amount, status, requested_at, payments ( status )')
      .eq('agency_client_id', selectedAgencyClientId);

    if (error) { console.error('Error refetching approvals:', error); return; }

    setAgencies(prev => prev.map(ag => {
      if (ag.id !== selectedAgencyClientId) return ag;
      return { ...ag, project: { ...ag.project, approvals: data || [] } };
    }));
  };

  // ── Fetch messages + subscribe to realtime when conversation changes ──
  useEffect(() => {
    if (!selectedAgencyClientId) return;

    setMessages([]);

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('agency_client_id', selectedAgencyClientId)
        .order('created_at', { ascending: true });

      if (!error && data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel(`messages:${selectedAgencyClientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `agency_client_id=eq.${selectedAgencyClientId}`,
        },
        (payload) => {
          setMessages(prev => {
            const optIdx = prev.findIndex(
              m => String(m.id).startsWith('opt-') &&
                   m.content === payload.new.content &&
                   m.sender_role === payload.new.sender_role
            );
            if (optIdx !== -1) {
              const next = [...prev];
              next[optIdx] = payload.new;
              return next;
            }
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    // Also listen for approval status changes (approve/paid) so the panel updates live
    const approvalsChannel = supabase
      .channel(`approvals:${selectedAgencyClientId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'approvals', filter: `agency_client_id=eq.${selectedAgencyClientId}` },
        () => refetchApprovals()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments', filter: `agency_client_id=eq.${selectedAgencyClientId}` },
        () => refetchApprovals()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(approvalsChannel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgencyClientId]);

  // ── Auto-scroll to bottom when messages change ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const agency = agencies.find(a => a.id === selectedAgencyClientId);
  const project = agency?.project;

  const sendMessage = async () => {
    if (!message.trim() || sending || !client || !selectedAgencyClientId) return;
    const content = message.trim();
    setMessage('');
    setSending(true);

    const optimistic = {
      id: `opt-${Date.now()}`,
      agency_client_id: selectedAgencyClientId,
      sender_id: client.id,
      sender_role: 'client',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    const { error } = await supabase.from('messages').insert({
      agency_client_id: selectedAgencyClientId,
      sender_id: client.id,
      sender_role: 'client',
      content,
    });

    if (error) {
      console.error('Send error:', error);
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
    }

    setSending(false);
  };

  // ── Approve a pending delivery approval (does NOT charge anything) ──
  const handleApprove = async (approvalId, title) => {
    const { error } = await supabase
      .from('approvals')
      .update({ status: 'approved', resolved_at: new Date().toISOString() })
      .eq('id', approvalId);

    if (error) {
      console.error('Error approving:', error);
      alert('Could not approve. Try again.');
      return;
    }

    await supabase.from('messages').insert({
      agency_client_id: selectedAgencyClientId,
      sender_id: client.id,
      sender_role: 'client',
      content: `[Approved] Client approved: "${title}"`,
    });

    refetchApprovals();
  };

  // ── Initiate a REAL Paystack payment via the backend for an approved delivery ──
  // Takes the approval's OWN amount, not the project's total budget.
  const handlePay = async (approvalId, approvalAmount) => {
    if (!selectedAgencyClientId || !client) return;
    const amount = Number(approvalAmount);
    if (!amount || amount <= 0) {
      alert('This approval has no valid amount set. Contact your agency.');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agency_client_id: selectedAgencyClientId,
          approval_id: approvalId,
          amount,
          email: client.email,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Payment initiation failed.');
        return;
      }

      // Redirect to Paystack's hosted checkout — actual payment happens here,
      // and the backend webhook flips the payments row to 'paid' once Paystack confirms.
      window.location.assign(json.authorization_url);
    } catch (err) {
      console.error('Error initiating payment:', err);
      alert('Could not connect to server. Please try again.');
    }
  };

  const openChangeModal = () => {
    setChangeTitle('');
    setChangeDesc('');
    setChangeModalOpen(true);
  };

  const submitChangeRequest = async (e) => {
    e.preventDefault();
    if (!selectedAgencyClientId || !client || !changeTitle.trim()) return;

    const { error } = await supabase.from('approvals').insert({
      agency_client_id: selectedAgencyClientId,
      type: 'change_request',
      title: changeTitle.trim(),
      description: changeDesc.trim() || null,
      status: 'pending',
      requested_by: client.id,
      // No amount — the agency prices this when they review it before it can be paid.
    });

    if (error) {
      console.error('Error inserting client change request:', error);
      alert('Could not send change request. Try again.');
      return;
    }

    await supabase.from('messages').insert({
      agency_client_id: selectedAgencyClientId,
      sender_id: client.id,
      sender_role: 'client',
      content: `[Change Request] Client requested changes: "${changeTitle.trim()}"`,
    });

    setChangeModalOpen(false);
    refetchApprovals();
  };

  const progressColor =
    project && project.progress >= 75 ? '#1D9E75'
    : project && project.progress >= 40 ? '#0ea5e9'
    : '#6C47FF';

  if (loadState === 'loading') return <div className="cp-shell"><div className="cp-loading">Loading your portal...</div></div>;
  if (loadState === 'error') return <div className="cp-shell"><div className="cp-loading">Couldn't load your portal. Try refreshing, or log in again.</div></div>;
  if (loadState === 'empty') return <div className="cp-shell"><div className="cp-loading">You're not connected to any agencies yet. If you were just approved by an agency, use the invite link they sent you to finish setup.</div></div>;

  const approvalsList = project?.approvals || [];
const needsApproval = approvalsList.filter(
  ap => ap.status === 'pending' && ap.amount != null && (ap.type === 'delivery_approval' || ap.type === 'change_request')
);
const awaitingPayment = approvalsList.filter(
  ap => ap.status === 'approved' && ap.type !== 'scope_creep_flag' && !ap.payments?.some(p => p.status === 'paid')
);
const completedPayments = approvalsList.filter(
  ap => ap.status === 'approved' && ap.type !== 'scope_creep_flag' && ap.payments?.some(p => p.status === 'paid')
);
const pendingChangeRequests = approvalsList.filter(ap => ap.status === 'pending' && ap.type === 'change_request' && ap.amount == null);
  return (
    <div className="cp-shell">
      {(!leftPanelCollapsed || rightPanelOpen) && (
        <div className="cp-backdrop" onClick={() => { setLeftPanelCollapsed(true); setRightPanelOpen(false); }} />
      )}

      {/* ── LEFT PANEL ── */}
      <div className={`cp-left ${leftPanelCollapsed ? 'collapsed' : ''}`}>
        <div className="cp-left-top">
          <div className="cp-left-header">
            <div className="cp-brand"><span className="cp-brand-dot"></span>ATSYNC</div>
            <button className="cp-left-close" onClick={() => setLeftPanelCollapsed(true)}>
              <i className="ti ti-x"></i>
            </button>
          </div>
          <div className="cp-section-label">Your agencies</div>
          <div className="cp-agency-list">
            {agencies.map(ag => (
              <div
                key={ag.id}
                className={`cp-agency-item ${selectedAgencyClientId === ag.id ? 'active' : ''}`}
                onClick={() => { setSelectedAgencyClientId(ag.id); if (isMobile()) setLeftPanelCollapsed(true); }}
              >
                <div className="cp-agency-row">
                  <div className="cp-agency-avatar" style={{ background: ag.color }} onClick={e => { e.stopPropagation(); setAgencyModal(ag); }}>
                    {ag.initials}
                  </div>
                  <div className="cp-agency-info">
                    <div className="cp-agency-name">{ag.name}</div>
                    <div className="cp-agency-project"><i className="ti ti-folder"></i> {ag.project.name}</div>
                  </div>
                  <div className={`cp-agency-dot ${ag.project.status}`}></div>
                </div>
                {selectedAgencyClientId === ag.id && (
                  <div className="cp-project-pill">
                    <div className="cp-project-pill-bar">
                      <div className="cp-project-pill-fill" style={{ width: `${ag.project.progress}%`, background: progressColor }}></div>
                    </div>
                    <span>{ag.project.progress}% complete</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="cp-left-bottom">
          <div className="cp-client-avatar" onClick={() => setAvatarPopup(p => !p)}>
            {getInitials(client?.user_metadata?.full_name || client?.email?.split('@')[0] || '?')}
          </div>
          <div className="cp-client-info">
            <div className="cp-client-name">{client?.user_metadata?.full_name || client?.email}</div>
            <div className="cp-client-role">Client</div>
          </div>
          {avatarPopup && (
            <AvatarPopup
              onViewProfile={() => { setAvatarPopup(false); setProfileModal(true); }}
              onSettings={() => navigate('/client/settings')}
            />
          )}
        </div>
      </div>

      {/* ── MIDDLE PANEL — CHAT ── */}
      <div className="cp-mid">
        <div className="cp-mid-header">
          <div className="cp-header-left">
            <button className="cp-header-tog" onClick={() => { const n = !leftPanelCollapsed; setLeftPanelCollapsed(n); if (!n) setRightPanelOpen(false); }}>
              <i className="ti ti-menu-2"></i>
            </button>
            <div className="cp-mid-agency-avatar" style={{ background: agency.color }} onClick={() => setAgencyModal(agency)}>
              {agency.initials}
            </div>
            <div>
              <div className="cp-mid-agency-name">{agency.name}</div>
              <div className="cp-mid-project-name">{project.name}</div>
            </div>
          </div>
          <div className="cp-header-right">
            <div className="cp-mid-phase-badge">{project.phase}</div>
            <button className="cp-header-tog" onClick={() => { const n = !rightPanelOpen; setRightPanelOpen(n); if (n) setLeftPanelCollapsed(true); }}>
              <i className="ti ti-info-circle"></i>
            </button>
          </div>
        </div>

        <div className="cp-chat-feed">
          {messages.length === 0 ? (
            <div className="cp-chat-empty">
              No messages yet. Send a message to start the conversation with {agency.name}.
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`cp-msg ${msg.sender_id === client?.id ? 'mine' : 'theirs'}`}>
                <div className="cp-msg-bubble">{msg.content}</div>
                <div className="cp-msg-time">{formatTime(msg.created_at)}</div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="cp-chat-input-row">
          <input
            className="cp-chat-input"
            placeholder={`Message ${agency.name}...`}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          />
          <button className="cp-send-btn" onClick={sendMessage} disabled={sending || !message.trim()}>
            <i className="ti ti-send"></i>
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className={`cp-right ${rightPanelOpen ? 'open' : 'collapsed'}`}>
        <div className="cp-right-close-row">
          <button className="cp-right-close" onClick={() => setRightPanelOpen(false)}>
            <i className="ti ti-x"></i>
          </button>
        </div>

        <div className="cp-right-section">
          <div className="cp-right-label">Project status</div>
          <div className="cp-phase-name">{project.phase}</div>
          <div className="cp-progress-track">
            <div className="cp-progress-fill" style={{ width: `${project.progress}%`, background: progressColor }}></div>
          </div>
          <div className="cp-progress-meta">
            <span style={{ color: progressColor }}>{project.progress}%</span>
            <span>complete</span>
          </div>
        </div>

        <div className="cp-right-section">
          <div className="cp-right-label">Revisions</div>
          <div className="cp-revision-row">
            {Array.from({ length: project.revisionsTotal || 0 }).map((_, i) => (
              <div key={i} className={`cp-revision-dot ${i < project.revisionsUsed ? 'used' : 'available'}`}></div>
            ))}
            <span className="cp-revision-text">{project.revisionsUsed}/{project.revisionsTotal} used</span>
          </div>
          <div className="cp-action-btns">
            <button className="cp-action-btn" onClick={openChangeModal}><i className="ti ti-edit"></i> Request changes</button>
            <button className="cp-action-btn secondary"><i className="ti ti-file-description"></i> Change brief</button>
          </div>
        </div>

        <div className="cp-right-section">
          <div className="cp-right-label">Your tasks</div>
          <div className="cp-tasks-list">
            {project.tasks.length === 0 ? (
              <div className="cp-empty-note">No tasks yet</div>
            ) : (
              project.tasks.map(task => (
                <div key={task.id} className={`cp-task-row ${task.done ? 'done' : ''}`}>
                  <div className={`cp-task-check ${task.done ? 'checked' : ''}`}>{task.done && <i className="ti ti-check"></i>}</div>
                  <span>{task.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {needsApproval.length > 0 && (
          <div className="cp-right-section">
            <div className="cp-right-label">Needs your approval</div>
            {needsApproval.map(ap => (
              <div key={ap.id} className="cp-approval-row">
                <div className="cp-approval-info">
                  <div className="cp-approval-title">{ap.title}</div>
                  <div className="cp-approval-date">
                    {ap.requested_at ? new Date(ap.requested_at).toLocaleDateString() : ''} · {fmtAmount(ap.amount)}
                  </div>
                </div>
                <button className="cp-approve-btn" onClick={() => handleApprove(ap.id, ap.title)}>
                  <i className="ti ti-check"></i> Approve
                </button>
              </div>
            ))}
          </div>
        )}

        {awaitingPayment.length > 0 && (
          <div className="cp-right-section">
            <div className="cp-right-label">Approved & Awaiting Payment</div>
            {awaitingPayment.map(ap => (
              <div key={ap.id} className="cp-approval-row" style={{ background: 'rgba(29,158,117,0.06)', borderColor: 'rgba(29,158,117,0.15)' }}>
                <div className="cp-approval-info">
                  <div className="cp-approval-title">{ap.title}</div>
                  <div className="cp-approval-date" style={{ color: 'var(--cp-green)' }}>
                    Approved · {fmtAmount(ap.amount)}
                  </div>
                </div>
                <button
                  className="cp-approve-btn"
                  style={{ background: 'var(--cp-green)' }}
                  onClick={() => handlePay(ap.id, ap.amount)}
                >
                  <i className="ti ti-credit-card"></i> Pay Now
                </button>
              </div>
            ))}
          </div>
        )}

        {completedPayments.length > 0 && (
          <div className="cp-right-section">
            <div className="cp-right-label">Completed Payments</div>
            {completedPayments.map(ap => (
              <div key={ap.id} className="cp-approval-row completed">
                <div className="cp-approval-info">
                  <div className="cp-approval-title">{ap.title}</div>
                  <div className="cp-approval-date">
                    Paid · {fmtAmount(ap.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pendingChangeRequests.length > 0 && (
          <div className="cp-right-section">
            <div className="cp-right-label">Pending change requests</div>
            {pendingChangeRequests.map(ap => (
              <div key={ap.id} className="cp-approval-row">
                <div className="cp-approval-info">
                  <div className="cp-approval-title">{ap.title}</div>
                  <div className="cp-approval-date cp-change-badge">Awaiting price from agency</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="cp-right-section">
          <div className="cp-right-label">Invoice</div>
          {project.invoice ? (
            <div className="cp-invoice-row">
              <div>
                <div className="cp-invoice-amount">{project.invoice.amount}</div>
                <div className="cp-invoice-due">Due {project.invoice.due}</div>
              </div>
              <span className={`cp-invoice-badge ${project.invoice.status.toLowerCase()}`}>{project.invoice.status}</span>
            </div>
          ) : (
            <div className="cp-empty-note">No invoice yet</div>
          )}
        </div>
      </div>

      {changeModalOpen && (
        <div className="cp-modal-backdrop" onClick={() => setChangeModalOpen(false)}>
          <div className="cp-modal" onClick={e => e.stopPropagation()}>
            <button className="cp-modal-close" onClick={() => setChangeModalOpen(false)}>
              <i className="ti ti-x"></i>
            </button>
            <div className="cp-modal-name">Request changes</div>
            <div className="cp-modal-tag" style={{ marginBottom: '12px' }}>
              Your agency will review this and reply with a price before any charge is made.
            </div>
            <form onSubmit={submitChangeRequest} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <div className="cp-profile-field">
                <label htmlFor="cp-change-title">What do you need changed?</label>
                <input
                  id="cp-change-title"
                  type="text"
                  value={changeTitle}
                  onChange={e => setChangeTitle(e.target.value)}
                  placeholder="e.g. Add a gallery section to homepage"
                  required
                />
              </div>
              <div className="cp-profile-field">
                <label htmlFor="cp-change-desc">Any extra detail? (optional)</label>
                <textarea
                  id="cp-change-desc"
                  rows={3}
                  value={changeDesc}
                  onChange={e => setChangeDesc(e.target.value)}
                  placeholder="Add context to help your agency scope this"
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <button type="submit" className="cp-profile-save">Send request</button>
            </form>
          </div>
        </div>
      )}

      {agencyModal && <AgencyModal agency={agencyModal} onClose={() => setAgencyModal(null)} />}
      {profileModal && <ClientProfileModal client={client} onClose={() => setProfileModal(false)} />}
    </div>
  );
};

export default ClientPortal;