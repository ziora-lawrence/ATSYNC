import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './clientportal.css';

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
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error

  const handleSave = async () => {
    setSaveState('saving');
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name.trim() },
    });

    if (error) {
      console.error('Error updating profile:', error);
      setSaveState('error');
      return;
    }

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

        {saveState === 'error' && (
          <div className="cp-profile-error">Couldn't save — try again.</div>
        )}
        {saveState === 'saved' && (
          <div className="cp-profile-saved">Saved!</div>
        )}

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

// Generate initials from a name
const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

// Fallback colors cycled per agency
const AGENCY_COLORS = ['#6C47FF', '#0ea5e9', '#1D9E75', '#f59e0b', '#ec4899'];

// ── Main Component ────────────────────────────────────────────
const ClientPortal = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();

  const [client, setClient] = useState(null);
  const [agencies, setAgencies] = useState([]); // shaped: { id (agency_client id), agency_id, name, initials, color, project }
  const [selectedAgencyClientId, setSelectedAgencyClientId] = useState(null);
  const [message, setMessage] = useState('');
  const isMobile = () => window.innerWidth <= 768;
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(isMobile());
  const [rightPanelOpen, setRightPanelOpen] = useState(!isMobile());
  const [agencyModal, setAgencyModal] = useState(null);
  const [profileModal, setProfileModal] = useState(false);
  const [avatarPopup, setAvatarPopup] = useState(false);
  const [loadState, setLoadState] = useState('loading'); // loading | ready | empty | error

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData?.user) {
        console.error('Error getting user:', userError);
        setLoadState('error');
        return;
      }

      setClient(userData.user);

      // Fetch agency_clients + agency profile + project, for this client
      const { data, error } = await supabase
        .from('agency_clients')
        .select(`
          id,
          agency_id,
          business_name,
          profiles ( agency_name ),
          projects ( id, name, phase, progress, revisions_used, revisions_total, status )
        `)
        .eq('client_id', userData.user.id);

      if (error) {
        console.error('Error fetching agency_clients:', error);
        setLoadState('error');
        return;
      }

      if (!data || data.length === 0) {
        setLoadState('empty');
        return;
      }

      const shaped = data.map((row, idx) => {
        const agencyName = row.profiles?.agency_name || row.business_name || 'Agency';
        const project = Array.isArray(row.projects) ? row.projects[0] : row.projects;

        return {
          id: row.id, // agency_clients.id
          agency_id: row.agency_id,
          name: agencyName,
          initials: getInitials(agencyName),
          color: AGENCY_COLORS[idx % AGENCY_COLORS.length],
          tagline: '',
          location: '',
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
                pendingApprovals: [],
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
                pendingApprovals: [],
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

  const agency = agencies.find(a => a.id === selectedAgencyClientId);
  const project = agency?.project;

  // Chat is still placeholder — messages table doesn't exist yet
  const currentChat = [];

  const sendMessage = () => {
    if (!message.trim()) return;
    // TODO: wire to real messages table once built
    setMessage('');
  };

  const progressColor =
    project && project.progress >= 75
      ? '#1D9E75'
      : project && project.progress >= 40
      ? '#0ea5e9'
      : '#6C47FF';

  if (loadState === 'loading') {
    return (
      <div className="cp-shell">
        <div className="cp-loading">Loading your portal...</div>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="cp-shell">
        <div className="cp-loading">
          Couldn't load your portal. Try refreshing, or log in again.
        </div>
      </div>
    );
  }

  if (loadState === 'empty') {
    return (
      <div className="cp-shell">
        <div className="cp-loading">
          You're not connected to any agencies yet. If you were just approved by an agency, use
          the invite link they sent you to finish setup.
        </div>
      </div>
    );
  }

  return (
    <div className="cp-shell">

      {/* Sidebar overlay backdrop for mobile */}
      {(!leftPanelCollapsed || rightPanelOpen) && (
        <div
          className="cp-backdrop"
          onClick={() => {
            setLeftPanelCollapsed(true);
            setRightPanelOpen(false);
          }}
        />
      )}

      {/* ── LEFT PANEL ── */}
      <div className={`cp-left ${leftPanelCollapsed ? 'collapsed' : ''}`}>
        <div className="cp-left-top">
          <div className="cp-left-header">
            <div className="cp-brand">
              <span className="cp-brand-dot"></span>
              ATSYNC
            </div>
            <button
              className="cp-left-close"
              onClick={() => setLeftPanelCollapsed(true)}
              title="Close panel"
            >
              <i className="ti ti-x"></i>
            </button>
          </div>
          <div className="cp-section-label">Your agencies</div>
          <div className="cp-agency-list">
            {agencies.map(ag => (
              <div
                key={ag.id}
                className={`cp-agency-item ${selectedAgencyClientId === ag.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedAgencyClientId(ag.id);
                  if (isMobile()) setLeftPanelCollapsed(true);
                }}
              >
                <div className="cp-agency-row">
                  <div
                    className="cp-agency-avatar"
                    style={{ background: ag.color }}
                    onClick={e => { e.stopPropagation(); setAgencyModal(ag); }}
                  >
                    {ag.initials}
                  </div>
                  <div className="cp-agency-info">
                    <div className="cp-agency-name">{ag.name}</div>
                    <div className="cp-agency-project">
                      <i className="ti ti-folder"></i> {ag.project.name}
                    </div>
                  </div>
                  <div className={`cp-agency-dot ${ag.project.status}`}></div>
                </div>
                {selectedAgencyClientId === ag.id && (
                  <div className="cp-project-pill">
                    <div className="cp-project-pill-bar">
                      <div
                        className="cp-project-pill-fill"
                        style={{ width: `${ag.project.progress}%`, background: progressColor }}
                      ></div>
                    </div>
                    <span>{ag.project.progress}% complete</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom avatar */}
        <div className="cp-left-bottom">
          <div className="cp-client-avatar" onClick={() => setAvatarPopup(p => !p)}>
            {getInitials(client?.user_metadata?.full_name || client?.email?.split('@')[0] || '?')}
          </div>
          <div className="cp-client-info">
            <div className="cp-client-name">
              {client?.user_metadata?.full_name || client?.email}
            </div>
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
            <button
              className="cp-header-tog"
              onClick={() => {
                const nextState = !leftPanelCollapsed;
                setLeftPanelCollapsed(nextState);
                if (!nextState) setRightPanelOpen(false);
              }}
              title="Toggle agencies"
            >
              <i className="ti ti-menu-2"></i>
            </button>
            <div
              className="cp-mid-agency-avatar"
              style={{ background: agency.color }}
              onClick={() => setAgencyModal(agency)}
            >
              {agency.initials}
            </div>
            <div>
              <div className="cp-mid-agency-name">{agency.name}</div>
              <div className="cp-mid-project-name">{project.name}</div>
            </div>
          </div>
          <div className="cp-header-right">
            <div className="cp-mid-phase-badge">{project.phase}</div>
            <button
              className="cp-header-tog"
              onClick={() => {
                const nextState = !rightPanelOpen;
                setRightPanelOpen(nextState);
                if (nextState) setLeftPanelCollapsed(true);
              }}
              title="Toggle details"
            >
              <i className="ti ti-info-circle"></i>
            </button>
          </div>
        </div>

        <div className="cp-chat-feed">
          {currentChat.length === 0 ? (
            <div className="cp-chat-empty">
              No messages yet. Chat is coming soon — for now, your agency will reach out
              directly.
            </div>
          ) : (
            currentChat.map(msg => (
              <div key={msg.id} className={`cp-msg ${msg.from === 'client' ? 'mine' : 'theirs'}`}>
                <div className="cp-msg-bubble">{msg.text}</div>
                <div className="cp-msg-time">{msg.time}</div>
              </div>
            ))
          )}
        </div>

        <div className="cp-chat-input-row">
          <input
            className="cp-chat-input"
            placeholder={`Message ${agency.name}...`}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            disabled
          />
          <button className="cp-send-btn" onClick={sendMessage} disabled>
            <i className="ti ti-send"></i>
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className={`cp-right ${rightPanelOpen ? 'open' : 'collapsed'}`}>
        <div className="cp-right-close-row">
          <button
            className="cp-right-close"
            onClick={() => setRightPanelOpen(false)}
            title="Close details"
          >
            <i className="ti ti-x"></i>
          </button>
        </div>

        {/* Project status */}
        <div className="cp-right-section">
          <div className="cp-right-label">Project status</div>
          <div className="cp-phase-name">{project.phase}</div>
          <div className="cp-progress-track">
            <div
              className="cp-progress-fill"
              style={{ width: `${project.progress}%`, background: progressColor }}
            ></div>
          </div>
          <div className="cp-progress-meta">
            <span style={{ color: progressColor }}>{project.progress}%</span>
            <span>complete</span>
          </div>
        </div>

        {/* Revisions */}
        <div className="cp-right-section">
          <div className="cp-right-label">Revisions</div>
          <div className="cp-revision-row">
            {Array.from({ length: project.revisionsTotal || 0 }).map((_, i) => (
              <div
                key={i}
                className={`cp-revision-dot ${i < project.revisionsUsed ? 'used' : 'available'}`}
              ></div>
            ))}
            <span className="cp-revision-text">
              {project.revisionsUsed}/{project.revisionsTotal} used
            </span>
          </div>
          <div className="cp-action-btns">
            <button className="cp-action-btn">
              <i className="ti ti-edit"></i> Request changes
            </button>
            <button className="cp-action-btn secondary">
              <i className="ti ti-file-description"></i> Change brief
            </button>
          </div>
        </div>

        {/* Tasks */}
        <div className="cp-right-section">
          <div className="cp-right-label">Your tasks</div>
          <div className="cp-tasks-list">
            {project.tasks.length === 0 ? (
              <div className="cp-empty-note">No tasks yet</div>
            ) : (
              project.tasks.map(task => (
                <div key={task.id} className={`cp-task-row ${task.done ? 'done' : ''}`}>
                  <div className={`cp-task-check ${task.done ? 'checked' : ''}`}>
                    {task.done && <i className="ti ti-check"></i>}
                  </div>
                  <span>{task.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending approvals */}
        {project.pendingApprovals.length > 0 && (
          <div className="cp-right-section">
            <div className="cp-right-label">Needs your approval</div>
            {project.pendingApprovals.map(ap => (
              <div key={ap.id} className="cp-approval-row">
                <div className="cp-approval-info">
                  <div className="cp-approval-title">{ap.title}</div>
                  <div className="cp-approval-date">{ap.date}</div>
                </div>
                <button className="cp-approve-btn">
                  <i className="ti ti-check"></i> Approve
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Invoice */}
        <div className="cp-right-section">
          <div className="cp-right-label">Invoice</div>
          {project.invoice ? (
            <div className="cp-invoice-row">
              <div>
                <div className="cp-invoice-amount">{project.invoice.amount}</div>
                <div className="cp-invoice-due">Due {project.invoice.due}</div>
              </div>
              <span className={`cp-invoice-badge ${project.invoice.status.toLowerCase()}`}>
                {project.invoice.status}
              </span>
            </div>
          ) : (
            <div className="cp-empty-note">No invoice yet</div>
          )}
        </div>

      </div>

      {/* Agency Modal */}
      {agencyModal && (
        <AgencyModal agency={agencyModal} onClose={() => setAgencyModal(null)} />
      )}

      {/* Client Profile Modal */}
      {profileModal && (
        <ClientProfileModal client={client} onClose={() => setProfileModal(false)} />
      )}

    </div>
  );
};

export default ClientPortal;
