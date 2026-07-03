import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';

export const Settings = () => {
  const { triggerToast, clients = [] } = useOutletContext();
  const location = useLocation();
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [toggles, setToggles] = useState({
    emailNotif: true,
    smsNotif: false,
    digestWeekly: true,
    autoLock: true,
    showSentiment: false,
    showScopeAlerts: true,
  });

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'general';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab');
    if (tabParam) setActiveTab(tabParam);
  }, [location.search]);

  const toggle = (key) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  const activeClientsCount = clients.filter(c => c.type === 'active').length;
  const pendingClientsCount = clients.filter(c => c.type === 'pending').length;
  const totalClientsUsed = activeClientsCount + pendingClientsCount;

  const handleCopyCode = () => {
    navigator.clipboard.writeText('atsync-team-x9k2-zw4r');
    setCopyStatus('Copied ✓');
    triggerToast('Team invite code copied to clipboard!');
    setTimeout(() => setCopyStatus('Copy'), 2000);
  };

  const agencyUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('atsync_user')) || { agencyName: 'Daniel Z.', email: 'atlassync1@gmail.com' };
    } catch {
      return { agencyName: 'Daniel Z.', email: 'atlassync1@gmail.com' };
    }
  })();

  const navItems = [
    { id: 'general', icon: 'ti-settings-2', label: 'General' },
    { id: 'notifications', icon: 'ti-bell', label: 'Notifications' },
    { id: 'intake', icon: 'ti-link', label: 'Intake Links' },
    { id: 'billing', icon: 'ti-credit-card', label: 'Billing' },
    { id: 'team', icon: 'ti-users', label: 'Team' },
    { id: 'danger', icon: 'ti-alert-triangle', label: 'Danger zone' },
  ];

  return (
    <div className="view" id="view-settings">
      <div className="settings-grid">
        {/* Settings Navigation */}
        <div className="settings-nav">
          {navItems.map(item => (
            <div
              key={item.id}
              className={`sn-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <i className={`ti ${item.icon}`}></i> {item.label}
            </div>
          ))}
        </div>

        {/* Settings Content */}
        <div className="settings-content">

          {/* ── GENERAL ── */}
          <div className={`spane ${activeTab === 'general' ? 'active' : ''}`}>
            <div className="section-card">
              <div className="section-card-title">Agency info</div>
              <div className="form-group">
                <label className="form-label">Agency name</label>
                <input type="text" className="form-input" defaultValue={agencyUser.agencyName} />
              </div>
              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input type="text" className="form-input" defaultValue="We build websites that work for you" />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" className="form-input" defaultValue="Ibadan, Nigeria" />
              </div>
              <div className="form-group">
                <label className="form-label">Primary currency</label>
                <select className="form-select">
                  <option>₦ NGN</option>
                  <option>$ USD</option>
                  <option>£ GBP</option>
                </select>
              </div>
              <button
                className="btn-primary"
                onClick={() => triggerToast('Agency info saved!')}
              >
                Save changes
              </button>
            </div>

            <div className="section-card">
              <div className="section-card-title">Defaults</div>
              <div className="setting-row">
                <div className="sr-left">
                  <div className="sr-label">Free revisions per project</div>
                  <div className="sr-sub">Clients get this many before scope creep triggers</div>
                </div>
                <input
                  type="number"
                  defaultValue="2"
                  min="0"
                  max="10"
                  style={{
                    width: '52px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-mid)',
                    borderRadius: '7px',
                    padding: '6px 8px',
                    color: 'var(--text)',
                    fontSize: '13px',
                    textAlign: 'center',
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />
              </div>
              <div className="setting-row">
                <div className="sr-left">
                  <div className="sr-label">Auto-lock brief after onboarding</div>
                  <div className="sr-sub">Prevents changes once client submits intake form</div>
                </div>
                <div className={`toggle ${toggles.autoLock ? '' : 'off'}`} onClick={() => toggle('autoLock')}></div>
              </div>
              <div className="setting-row">
                <div className="sr-left">
                  <div className="sr-label">Show sentiment score to client</div>
                  <div className="sr-sub">Clients will see their relationship health score</div>
                </div>
                <div className={`toggle ${toggles.showSentiment ? '' : 'off'}`} onClick={() => toggle('showSentiment')}></div>
              </div>
            </div>
          </div>

          {/* ── NOTIFICATIONS ── */}
          <div className={`spane ${activeTab === 'notifications' ? 'active' : ''}`}>
            <div className="section-card">
              <div className="section-card-title">Email notifications</div>
              <div className="setting-row">
                <div className="sr-left">
                  <div className="sr-label">Client activity alerts</div>
                  <div className="sr-sub">Get notified when a client approves or rejects</div>
                </div>
                <div className={`toggle ${toggles.emailNotif ? '' : 'off'}`} onClick={() => toggle('emailNotif')}></div>
              </div>
              <div className="setting-row">
                <div className="sr-left">
                  <div className="sr-label">Weekly digest</div>
                  <div className="sr-sub">A summary of activity every Monday morning</div>
                </div>
                <div className={`toggle ${toggles.digestWeekly ? '' : 'off'}`} onClick={() => toggle('digestWeekly')}></div>
              </div>
              <div className="setting-row">
                <div className="sr-left">
                  <div className="sr-label">Scope creep warnings</div>
                  <div className="sr-sub">Alert when a client exceeds their revision limit</div>
                </div>
                <div className={`toggle ${toggles.showScopeAlerts ? '' : 'off'}`} onClick={() => toggle('showScopeAlerts')}></div>
              </div>
            </div>
            <div className="section-card">
              <div className="section-card-title">SMS / WhatsApp</div>
              <div className="setting-row">
                <div className="sr-left">
                  <div className="sr-label">SMS alerts for approvals</div>
                  <div className="sr-sub">Receive SMS when a client responds to approval requests</div>
                </div>
                <div className={`toggle ${toggles.smsNotif ? '' : 'off'}`} onClick={() => toggle('smsNotif')}></div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <label className="form-label">Phone number</label>
                <input type="tel" className="form-input" placeholder="+234..." />
              </div>
            </div>
          </div>

          {/* ── INTAKE LINKS ── */}
          <div className={`spane ${activeTab === 'intake' ? 'active' : ''}`}>
            <div className="section-card">
              <div className="section-card-title">Your intake link</div>
              <div style={{ fontSize: '13px', color: 'var(--text-sec)', marginBottom: '14px', lineHeight: 1.6 }}>
                Share this link with prospective clients to collect their project brief before onboarding them to the roster.
              </div>
              <div style={{
                display: 'flex',
                gap: '8px',
                background: 'var(--bg-sub)',
                border: '1px solid var(--border)',
                padding: '10px 14px',
                borderRadius: '8px',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px'
              }}>
                <span style={{ fontSize: '12.5px', color: 'var(--ac-mid)' }}>https://atsync.app/intake/dz-k29xmr</span>
                <button
                  onClick={() => { navigator.clipboard.writeText('https://atsync.app/intake/dz-k29xmr'); triggerToast('Intake link copied!'); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--ac-mid)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', fontFamily: 'inherit' }}
                >
                  Copy
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-outline" onClick={() => triggerToast('Opening email draft...')}><i className="ti ti-mail"></i> Email</button>
                <button className="btn-outline" onClick={() => triggerToast('Opening WhatsApp...')}><i className="ti ti-brand-whatsapp"></i> WhatsApp</button>
                <button className="btn-outline" onClick={() => triggerToast('Link regenerated!')}><i className="ti ti-refresh"></i> Regenerate</button>
              </div>
            </div>
            <div className="section-card">
              <div className="section-card-title">Pending submissions</div>
              {clients.filter(c => c.type === 'pending').length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--text-sec)' }}>No pending intake submissions.</div>
              ) : (
                clients.filter(c => c.type === 'pending').map(c => (
                  <div key={c.id} className="setting-row">
                    <div className="sr-left">
                      <div className="sr-label">{c.name}</div>
                      <div className="sr-sub">Submitted intake form — awaiting review</div>
                    </div>
                    <button className="btn-primary" style={{ fontSize: '11px', padding: '5px 12px' }} onClick={() => triggerToast(`${c.name} approved!`)}>
                      Approve
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── BILLING ── */}
          <div className={`spane ${activeTab === 'billing' ? 'active' : ''}`}>
            <div className="section-card">
              <div className="section-card-title">Current plan</div>
              <div className="setting-row">
                <div className="sr-left">
                  <div className="sr-label">Subscription tier</div>
                  <div className="sr-sub">Renews next month · billed monthly</div>
                </div>
                <span className="sent-badge sent-good">Growth — $15/mo</span>
              </div>
              <div className="setting-row">
                <div className="sr-left">
                  <div className="sr-label">Transaction commissions</div>
                  <div className="sr-sub">Applied to all delivery approvals</div>
                </div>
                <div className="fld-val">1% per transaction</div>
              </div>
              <div className="setting-row">
                <div className="sr-left">
                  <div className="sr-label">Active roster capacity</div>
                  <div className="sr-sub">Client slots used this month</div>
                </div>
                <div className="fld-val">{totalClientsUsed} of 15 slots</div>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <button className="btn-primary" onClick={() => triggerToast('Upgrade flow coming in V1.')}>Upgrade plan</button>
                <button className="btn-outline" onClick={() => triggerToast('Billing portal coming in V1.')}>Manage billing</button>
              </div>
            </div>
            <div className="section-card">
              <div className="section-card-title">Payment history</div>
              {[
                { date: 'Jun 1, 2026', amount: '$15.00', status: 'Paid' },
                { date: 'May 1, 2026', amount: '$15.00', status: 'Paid' },
                { date: 'Apr 1, 2026', amount: '$15.00', status: 'Paid' },
              ].map((row, i) => (
                <div key={i} className="setting-row">
                  <div className="sr-left">
                    <div className="sr-label">{row.date}</div>
                    <div className="sr-sub">Monthly subscription</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text)' }}>{row.amount}</span>
                    <span className="sent-badge sent-good">{row.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── TEAM ── */}
          <div className={`spane ${activeTab === 'team' ? 'active' : ''}`}>
            <div className="section-card">
              <div className="section-card-title">Team members</div>
              <div className="setting-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '11px' }}>
                    {agencyUser.agencyName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="sr-left">
                    <div className="sr-label">{agencyUser.agencyName}</div>
                    <div className="sr-sub">{agencyUser.email}</div>
                  </div>
                </div>
                <span className="sent-badge sent-good">Owner</span>
              </div>
              <div className="setting-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '11px', background: 'var(--green)' }}>
                    CF
                  </div>
                  <div className="sr-left">
                    <div className="sr-label">Co-founder 1</div>
                    <div className="sr-sub">Joined June 2026</div>
                  </div>
                </div>
                <span className="sent-badge sent-ok">Editor</span>
              </div>
            </div>
            <div className="section-card">
              <div className="section-card-title">Invite a teammate</div>
              <div style={{ fontSize: '13px', color: 'var(--text-sec)', marginBottom: '14px', lineHeight: 1.6 }}>
                Share your invite code or send a direct email invite. New members join as Editors by default.
              </div>
              <div style={{
                display: 'flex',
                gap: '8px',
                background: 'var(--bg-sub)',
                border: '1px solid var(--border)',
                padding: '10px 14px',
                borderRadius: '8px',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '12.5px', color: 'var(--ac-mid)' }}>Invite code: atsync-team-x9k2-zw4r</span>
                <button
                  onClick={handleCopyCode}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: copyStatus === 'Copied ✓' ? 'var(--green)' : 'var(--ac-mid)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    fontFamily: 'inherit'
                  }}
                >
                  {copyStatus}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="email" className="form-input" placeholder="teammate@email.com" style={{ flex: 1 }} />
                <button className="btn-primary" onClick={() => triggerToast('Invite email sent!')}>
                  <i className="ti ti-send"></i> Invite
                </button>
              </div>
            </div>
          </div>

          {/* ── DANGER ZONE ── */}
          <div className={`spane ${activeTab === 'danger' ? 'active' : ''}`}>
            <div className="section-card">
              <div className="section-card-title">Data & privacy</div>
              <div className="setting-row">
                <div className="sr-left">
                  <div className="sr-label">Export all agency data</div>
                  <div className="sr-sub">Download a full export of your clients, tasks, and payments as a JSON file</div>
                </div>
                <button className="btn-outline" onClick={() => triggerToast('Export queued — you&apos;ll receive an email when ready.')}>
                  <i className="ti ti-download"></i> Export
                </button>
              </div>
              <div className="setting-row">
                <div className="sr-left">
                  <div className="sr-label">Clear chat logs</div>
                  <div className="sr-sub">Permanently delete all message history across all clients</div>
                </div>
                <button className="btn-outline danger" onClick={() => triggerToast('Chat log deletion is disabled in preview.')}>
                  Clear logs
                </button>
              </div>
            </div>

            <div className="danger-zone">
              <div className="dz-title">Danger zone</div>
              <div className="setting-row" style={{ border: 'none', paddingTop: 0 }}>
                <div className="sr-left">
                  <div className="sr-label" style={{ color: 'var(--red)' }}>Delete agency account</div>
                  <div className="sr-sub">This will permanently remove your agency, all clients, tasks, and payments. This action cannot be undone.</div>
                </div>
                <button
                  className="btn-outline danger"
                  onClick={() => triggerToast('Account deletion requests are disabled in preview.')}
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
