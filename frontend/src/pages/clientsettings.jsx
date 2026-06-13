import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './clientsettings.css';

const mockClient = {
  name: 'Chidi Okeke',
  email: 'chidi@example.com',
  phone: '+234 801 234 5678',
  initials: 'CO',
};

const pendingAgencies = [
  { id: 'ag-3', name: 'Kreatif Studio', initials: 'KS', color: '#0ea5e9', submittedDate: 'Jun 9', status: 'pending' },
  { id: 'ag-4', name: 'Vox Media NG', initials: 'VM', color: '#8b5cf6', submittedDate: 'Jun 5', status: 'rejected', reason: 'Budget below minimum' },
];

const navItems = [
  { id: 'general', icon: 'ti-settings-2', label: 'General' },
  { id: 'notifications', icon: 'ti-bell', label: 'Notifications' },
  { id: 'intake', icon: 'ti-link', label: 'Intake' },
  { id: 'billing', icon: 'ti-credit-card', label: 'Billing' },
  { id: 'danger', icon: 'ti-alert-triangle', label: 'Danger zone' },
];

const ClientSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [toggles, setToggles] = useState({
    emailUpdates: true,
    approvalAlerts: true,
    invoiceAlerts: true,
    digestWeekly: false,
  });

  const toggle = key => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="cs-shell">

      {/* Top bar */}
      <div className="cs-topbar">
        <button className="cs-back-btn" onClick={() => navigate(-1)}>
          <i className="ti ti-arrow-left"></i> Back to portal
        </button>
        <div className="cs-topbar-title">Settings</div>
      </div>

      <div className="cs-body">

        {/* Sidebar nav */}
        <div className="cs-nav">
          {navItems.map(item => (
            <div
              key={item.id}
              className={`cs-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <i className={`ti ${item.icon}`}></i>
              {item.label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="cs-content">

          {/* ── GENERAL ── */}
          {activeTab === 'general' && (
            <div className="cs-pane">
              <div className="cs-section">
                <div className="cs-section-title">Profile</div>
                <div className="cs-form-group">
                  <label className="cs-label">Full name</label>
                  <input className="cs-input" defaultValue={mockClient.name} />
                </div>
                <div className="cs-form-group">
                  <label className="cs-label">Email</label>
                  <input className="cs-input" defaultValue={mockClient.email} />
                </div>
                <div className="cs-form-group">
                  <label className="cs-label">Phone</label>
                  <input className="cs-input" defaultValue={mockClient.phone} />
                </div>
                <button className="cs-btn-primary">Save changes</button>
              </div>

              <div className="cs-section">
                <div className="cs-section-title">Password</div>
                <div className="cs-form-group">
                  <label className="cs-label">Current password</label>
                  <input className="cs-input" type="password" placeholder="••••••••" />
                </div>
                <div className="cs-form-group">
                  <label className="cs-label">New password</label>
                  <input className="cs-input" type="password" placeholder="••••••••" />
                </div>
                <button className="cs-btn-primary">Update password</button>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === 'notifications' && (
            <div className="cs-pane">
              <div className="cs-section">
                <div className="cs-section-title">Email notifications</div>
                {[
                  { key: 'emailUpdates', label: 'Project updates', desc: 'When an agency moves your project to a new phase' },
                  { key: 'approvalAlerts', label: 'Approval requests', desc: 'When an agency needs you to review a deliverable' },
                  { key: 'invoiceAlerts', label: 'Invoice alerts', desc: 'When a new invoice is issued or a payment is due' },
                  { key: 'digestWeekly', label: 'Weekly digest', desc: 'Summary of all your active projects every Monday' },
                ].map(item => (
                  <div key={item.key} className="cs-toggle-row">
                    <div>
                      <div className="cs-toggle-label">{item.label}</div>
                      <div className="cs-toggle-desc">{item.desc}</div>
                    </div>
                    <div
                      className={`cs-toggle ${toggles[item.key] ? 'on' : ''}`}
                      onClick={() => toggle(item.key)}
                    >
                      <div className="cs-toggle-thumb"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── INTAKE ── */}
          {activeTab === 'intake' && (
            <div className="cs-pane">
              <div className="cs-section">
                <div className="cs-section-title">Pending responses</div>
                <div className="cs-section-desc">Agencies you've submitted intake forms to that haven't responded yet.</div>
                {pendingAgencies.filter(a => a.status === 'pending').length === 0 ? (
                  <div className="cs-empty">No pending submissions</div>
                ) : (
                  pendingAgencies.filter(a => a.status === 'pending').map(ag => (
                    <div key={ag.id} className="cs-agency-row">
                      <div className="cs-agency-avatar" style={{ background: ag.color }}>{ag.initials}</div>
                      <div className="cs-agency-info">
                        <div className="cs-agency-name">{ag.name}</div>
                        <div className="cs-agency-meta">Submitted {ag.submittedDate}</div>
                      </div>
                      <span className="cs-badge pending">Awaiting</span>
                    </div>
                  ))
                )}
              </div>

              <div className="cs-section">
                <div className="cs-section-title">Rejected applications</div>
                <div className="cs-section-desc">Agencies that declined your intake submission.</div>
                {pendingAgencies.filter(a => a.status === 'rejected').length === 0 ? (
                  <div className="cs-empty">No rejections</div>
                ) : (
                  pendingAgencies.filter(a => a.status === 'rejected').map(ag => (
                    <div key={ag.id} className="cs-agency-row">
                      <div className="cs-agency-avatar" style={{ background: ag.color }}>{ag.initials}</div>
                      <div className="cs-agency-info">
                        <div className="cs-agency-name">{ag.name}</div>
                        <div className="cs-agency-meta">{ag.reason}</div>
                      </div>
                      <span className="cs-badge rejected">Rejected</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── BILLING ── */}
          {activeTab === 'billing' && (
            <div className="cs-pane">
              <div className="cs-section">
                <div className="cs-section-title">Payment history</div>
                <div className="cs-section-desc">All invoices across your active agencies.</div>
                <div className="cs-invoice-table">
                  {[
                    { agency: 'Atlas Sync', project: 'E-commerce Website', amount: '₦350,000', status: 'pending', date: 'Jun 10' },
                    { agency: 'Pixel Forge', project: 'Brand Identity', amount: '₦180,000', status: 'paid', date: 'Jun 1' },
                  ].map((inv, i) => (
                    <div key={i} className="cs-invoice-row">
                      <div className="cs-invoice-info">
                        <div className="cs-invoice-name">{inv.agency}</div>
                        <div className="cs-invoice-project">{inv.project} · {inv.date}</div>
                      </div>
                      <div className="cs-invoice-right">
                        <div className="cs-invoice-amount">{inv.amount}</div>
                        <span className={`cs-badge ${inv.status}`}>{inv.status === 'paid' ? 'Paid' : 'Pending'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── DANGER ZONE ── */}
          {activeTab === 'danger' && (
            <div className="cs-pane">
              <div className="cs-section danger">
                <div className="cs-section-title danger">Danger zone</div>
                <div className="cs-danger-row">
                  <div>
                    <div className="cs-danger-label">Leave an agency</div>
                    <div className="cs-danger-desc">Remove yourself from an active project. This cannot be undone.</div>
                  </div>
                  <button className="cs-btn-danger">Leave agency</button>
                </div>
                <div className="cs-divider"></div>
                <div className="cs-danger-row">
                  <div>
                    <div className="cs-danger-label">Delete account</div>
                    <div className="cs-danger-desc">Permanently delete your ATSYNC client account and all associated data.</div>
                  </div>
                  <button className="cs-btn-danger">Delete account</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ClientSettings;
