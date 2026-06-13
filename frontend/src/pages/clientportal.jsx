import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './clientportal.css';

// ── Mocked Data ──────────────────────────────────────────────
const mockClient = {
  id: 'client-001',
  name: 'Chidi Okeke',
  initials: 'CO',
};

const mockAgencies = [
  {
    id: 'ag-1',
    name: 'Atlas Sync',
    initials: 'AS',
    tagline: 'We build websites that work for you',
    location: 'Ibadan, Nigeria',
    socials: { twitter: '@atlassync', instagram: '@atlassync' },
    color: '#6C47FF',
    project: {
      id: 'proj-1',
      name: 'E-commerce Website',
      phase: 'Phase 2 — Design',
      progress: 45,
      revisionsUsed: 1,
      revisionsTotal: 3,
      status: 'active',
      tasks: [
        { id: 1, text: 'Review homepage mockup', done: false, clientVisible: true },
        { id: 2, text: 'Confirm brand colors', done: true, clientVisible: true },
        { id: 3, text: 'Approve product page layout', done: false, clientVisible: true },
      ],
      pendingApprovals: [
        { id: 'ap-1', title: 'Homepage Design v2', date: 'Jun 10', type: 'delivery' },
      ],
      invoice: { amount: '₦350,000', status: 'Pending', due: 'Jun 20' },
    },
    chat: [
      { id: 1, from: 'agency', name: 'Atlas Sync', text: 'Hey Chidi! Homepage mockup is ready for your review.', time: '10:24 AM' },
      { id: 2, from: 'client', name: 'Chidi', text: 'Looks great! Just one thing — can we make the hero section taller?', time: '10:31 AM' },
      { id: 3, from: 'agency', name: 'Atlas Sync', text: "Sure, we'll update that and send a revised version by EOD.", time: '10:35 AM' },
      { id: 4, from: 'client', name: 'Chidi', text: 'Perfect, thanks!', time: '10:36 AM' },
    ],
  },
  {
    id: 'ag-2',
    name: 'Pixel Forge',
    initials: 'PF',
    tagline: 'Motion & brand design studio',
    location: 'Lagos, Nigeria',
    socials: { twitter: '@pixelforge', instagram: '@pixelforge.ng' },
    color: '#0ea5e9',
    project: {
      id: 'proj-2',
      name: 'Brand Identity Package',
      phase: 'Phase 1 — Discovery',
      progress: 20,
      revisionsUsed: 0,
      revisionsTotal: 2,
      status: 'active',
      tasks: [
        { id: 1, text: 'Fill brand questionnaire', done: true, clientVisible: true },
        { id: 2, text: 'Mood board approval', done: false, clientVisible: true },
      ],
      pendingApprovals: [],
      invoice: { amount: '₦180,000', status: 'Paid', due: 'Jun 1' },
    },
    chat: [
      { id: 1, from: 'agency', name: 'Pixel Forge', text: "Welcome Chidi! We've started on your brand discovery phase.", time: 'Jun 8' },
      { id: 2, from: 'client', name: 'Chidi', text: 'Excited to see what you come up with!', time: 'Jun 8' },
    ],
  },
];

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
      <div className="cp-modal-location">
        <i className="ti ti-map-pin"></i> {agency.location}
      </div>
      <div className="cp-modal-socials">
        <span><i className="ti ti-brand-twitter"></i> {agency.socials.twitter}</span>
        <span><i className="ti ti-brand-instagram"></i> {agency.socials.instagram}</span>
      </div>
    </div>
  </div>
);

// ── Avatar Popup ──────────────────────────────────────────────
const AvatarPopup = ({ onClose, onSettings }) => (
  <div className="cp-avatar-popup">
    <div className="cp-avatar-popup-item" onClick={onClose}>
      <i className="ti ti-user"></i> View Profile
    </div>
    <div className="cp-avatar-popup-item" onClick={onSettings}>
      <i className="ti ti-settings-2"></i> Settings
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────
const ClientPortal = () => {
  const navigate = useNavigate();
  const [selectedAgencyId, setSelectedAgencyId] = useState(mockAgencies[0].id);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState(
    Object.fromEntries(mockAgencies.map(a => [a.id, a.chat]))
  );
  const [agencyModal, setAgencyModal] = useState(null);
  const [avatarPopup, setAvatarPopup] = useState(false);

  const agency = mockAgencies.find(a => a.id === selectedAgencyId);
  const project = agency.project;
  const currentChat = chats[selectedAgencyId] || [];

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMsg = {
      id: Date.now(),
      from: 'client',
      name: mockClient.name,
      text: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChats(prev => ({ ...prev, [selectedAgencyId]: [...prev[selectedAgencyId], newMsg] }));
    setMessage('');
  };

  const progressColor = project.progress >= 75 ? '#1D9E75' : project.progress >= 40 ? '#0ea5e9' : '#6C47FF';

  return (
    <div className="cp-shell">

      {/* ── LEFT PANEL ── */}
      <div className="cp-left">
        <div className="cp-left-top">
          <div className="cp-brand">
            <span className="cp-brand-dot"></span>
            ATSYNC
          </div>
          <div className="cp-section-label">Your agencies</div>
          <div className="cp-agency-list">
            {mockAgencies.map(ag => (
              <div
                key={ag.id}
                className={`cp-agency-item ${selectedAgencyId === ag.id ? 'active' : ''}`}
                onClick={() => setSelectedAgencyId(ag.id)}
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
                {selectedAgencyId === ag.id && (
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
            {mockClient.initials}
          </div>
          <div className="cp-client-info">
            <div className="cp-client-name">{mockClient.name}</div>
            <div className="cp-client-role">Client</div>
          </div>
          {avatarPopup && (
            <AvatarPopup
              onClose={() => setAvatarPopup(false)}
              onSettings={() => navigate('/client/settings')}
            />
          )}
        </div>
      </div>

      {/* ── MIDDLE PANEL — CHAT ── */}
      <div className="cp-mid">
        <div className="cp-mid-header">
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
          <div className="cp-mid-phase-badge">{project.phase}</div>
        </div>

        <div className="cp-chat-feed">
          {currentChat.map(msg => (
            <div key={msg.id} className={`cp-msg ${msg.from === 'client' ? 'mine' : 'theirs'}`}>
              <div className="cp-msg-bubble">{msg.text}</div>
              <div className="cp-msg-time">{msg.time}</div>
            </div>
          ))}
        </div>

        <div className="cp-chat-input-row">
          <input
            className="cp-chat-input"
            placeholder="Message Atlas Sync..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button className="cp-send-btn" onClick={sendMessage}>
            <i className="ti ti-send"></i>
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="cp-right">

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
            {Array.from({ length: project.revisionsTotal }).map((_, i) => (
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
            {project.tasks.map(task => (
              <div key={task.id} className={`cp-task-row ${task.done ? 'done' : ''}`}>
                <div className={`cp-task-check ${task.done ? 'checked' : ''}`}>
                  {task.done && <i className="ti ti-check"></i>}
                </div>
                <span>{task.text}</span>
              </div>
            ))}
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
          <div className="cp-invoice-row">
            <div>
              <div className="cp-invoice-amount">{project.invoice.amount}</div>
              <div className="cp-invoice-due">Due {project.invoice.due}</div>
            </div>
            <span className={`cp-invoice-badge ${project.invoice.status.toLowerCase()}`}>
              {project.invoice.status}
            </span>
          </div>
        </div>

      </div>

      {/* Agency Modal */}
      {agencyModal && (
        <AgencyModal agency={agencyModal} onClose={() => setAgencyModal(null)} />
      )}

    </div>
  );
};

export default ClientPortal;
