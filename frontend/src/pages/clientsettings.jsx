import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './clientsettings.css';

const navItems = [
  { id: 'general', icon: 'ti-settings-2', label: 'General' },
  { id: 'notifications', icon: 'ti-bell', label: 'Notifications' },
  { id: 'intake', icon: 'ti-link', label: 'Intake' },
  { id: 'billing', icon: 'ti-credit-card', label: 'Billing' },
  { id: 'danger', icon: 'ti-alert-triangle', label: 'Danger zone' },
];

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const AGENCY_COLORS = ['#6C47FF', '#0ea5e9', '#1D9E75', '#f59e0b', '#ec4899'];

const ClientSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');

  const [client, setClient] = useState(null);
  const [name, setName] = useState('');
  const [profileSaveState, setProfileSaveState] = useState('idle');
  const [profileError, setProfileError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [passwordSaveState, setPasswordSaveState] = useState('idle');
  const [passwordError, setPasswordError] = useState('');

  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);

  const [toggles, setToggles] = useState({
    emailUpdates: true,
    approvalAlerts: true,
    invoiceAlerts: true,
    digestWeekly: false,
  });

  const toggleItem = key => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    const load = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData?.user) {
        console.error('Error getting user:', userError);
        setSubmissionsLoading(false);
        return;
      }

      setClient(userData.user);
      setName(userData.user.user_metadata?.full_name || '');

      const { data, error } = await supabase
        .from('intake_submissions')
        .select('*')
        .eq('client_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching intake submissions:', error);
      } else {
        setSubmissions(data || []);
      }
      setSubmissionsLoading(false);
    };

    load();
  }, []);

  const handleSaveProfile = async () => {
    setProfileSaveState('saving');
    setProfileError('');

    const { error } = await supabase.auth.updateUser({
      data: { full_name: name.trim() },
    });

    if (error) {
      console.error('Error updating profile:', error);
      setProfileError('Could not save changes.');
      setProfileSaveState('error');
      return;
    }

    setProfileSaveState('saved');
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      setPasswordSaveState('error');
      return;
    }

    setPasswordSaveState('saving');
    setPasswordError('');

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error('Error updating password:', error);
      setPasswordError(error.message || 'Could not update password.');
      setPasswordSaveState('error');
      return;
    }

    setPasswordSaveState('saved');
    setNewPassword('');
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const rejectedSubmissions = submissions.filter(s => s.status === 'rejected');

  return (
    <div className="cs-shell">

      <div className="cs-topbar">
        <button className="cs-back-btn" onClick={() => navigate(-1)}>
          <i className="ti ti-arrow-left"></i> Back to portal
        </button>
        <div className="cs-topbar-title">Settings</div>
      </div>

      <div className="cs-body">

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

        <div className="cs-content">

          {activeTab === 'general' && (
            <div className="cs-pane">
              <div className="cs-section">
                <div className="cs-section-title">Profile</div>
                <div className="cs-form-group">
                  <label className="cs-label">Full name</label>
                  <input
                    className="cs-input"
                    value={name}
                    onChange={e => { setName(e.target.value); setProfileSaveState('idle'); }}
                  />
                </div>
                <div className="cs-form-group">
                  <label className="cs-label">Email</label>
                  <input className="cs-input" value={client?.email || ''} disabled />
                </div>

                {profileSaveState === 'error' && (
                  <div className="cs-error">{profileError}</div>
                )}
                {profileSaveState === 'saved' && (
                  <div className="cs-success">Saved!</div>
                )}

                <button
                  className="cs-btn-primary"
                  onClick={handleSaveProfile}
                  disabled={profileSaveState === 'saving'}
                >
                  {profileSaveState === 'saving' ? 'Saving...' : 'Save changes'}
                </button>
              </div>

              <div className="cs-section">
                <div className="cs-section-title">Password</div>
                <div className="cs-section-desc">
                  Enter a new password below. You'll stay logged in on this device.
                </div>
                <div className="cs-form-group">
                  <label className="cs-label">New password</label>
                  <input
                    className="cs-input"
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setPasswordSaveState('idle'); }}
                  />
                </div>

                {passwordSaveState === 'error' && (
                  <div className="cs-error">{passwordError}</div>
                )}
                {passwordSaveState === 'saved' && (
                  <div className="cs-success">Password updated!</div>
                )}

                <button
                  className="cs-btn-primary"
                  onClick={handleUpdatePassword}
                  disabled={passwordSaveState === 'saving'}
                >
                  {passwordSaveState === 'saving' ? 'Updating...' : 'Update password'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="cs-pane">
              <div className="cs-section">
                <div className="cs-section-title">Email notifications</div>
                <div className="cs-section-desc">
                  These preferences aren't saved yet — coming soon.
                </div>
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
                      onClick={() => toggleItem(item.key)}
                    >
                      <div className="cs-toggle-thumb"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'intake' && (
            <div className="cs-pane">
              <div className="cs-section">
                <div className="cs-section-title">Pending responses</div>
                <div className="cs-section-desc">
                  Agencies you've submitted intake forms to that haven't responded yet.
                </div>
                {submissionsLoading ? (
                  <div className="cs-empty">Loading...</div>
                ) : pendingSubmissions.length === 0 ? (
                  <div className="cs-empty">No pending submissions</div>
                ) : (
                  pendingSubmissions.map((s, i) => (
                    <div key={s.id} className="cs-agency-row">
                      <div
                        className="cs-agency-avatar"
                        style={{ background: AGENCY_COLORS[i % AGENCY_COLORS.length] }}
                      >
                        {getInitials(s.business_name || s.name)}
                      </div>
                      <div className="cs-agency-info">
                        <div className="cs-agency-name">{s.business_name || s.name}</div>
                        <div className="cs-agency-meta">
                          {s.service_needed} · Submitted{' '}
                          {new Date(s.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="cs-badge pending">Awaiting</span>
                    </div>
                  ))
                )}
              </div>

              <div className="cs-section">
                <div className="cs-section-title">Rejected applications</div>
                <div className="cs-section-desc">Agencies that declined your intake submission.</div>
                {submissionsLoading ? (
                  <div className="cs-empty">Loading...</div>
                ) : rejectedSubmissions.length === 0 ? (
                  <div className="cs-empty">No rejections</div>
                ) : (
                  rejectedSubmissions.map((s, i) => (
                    <div key={s.id} className="cs-agency-row">
                      <div
                        className="cs-agency-avatar"
                        style={{ background: AGENCY_COLORS[i % AGENCY_COLORS.length] }}
                      >
                        {getInitials(s.business_name || s.name)}
                      </div>
                      <div className="cs-agency-info">
                        <div className="cs-agency-name">{s.business_name || s.name}</div>
                        <div className="cs-agency-meta">{s.service_needed}</div>
                      </div>
                      <span className="cs-badge rejected">Rejected</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="cs-pane">
              <div className="cs-section">
                <div className="cs-section-title">Payment history</div>
                <div className="cs-section-desc">
                  Invoice tracking isn't wired up yet — coming soon.
                </div>
                <div className="cs-empty">No invoices yet</div>
              </div>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="cs-pane">
              <div className="cs-section danger">
                <div className="cs-section-title danger">Danger zone</div>
                <div className="cs-danger-row">
                  <div>
                    <div className="cs-danger-label">Leave an agency</div>
                    <div className="cs-danger-desc">Remove yourself from an active project. This cannot be undone.</div>
                  </div>
                  <button className="cs-btn-danger" disabled title="Coming soon">
                    Leave agency
                  </button>
                </div>
                <div className="cs-divider"></div>
                <div className="cs-danger-row">
                  <div>
                    <div className="cs-danger-label">Delete account</div>
                    <div className="cs-danger-desc">Permanently delete your ATSYNC client account and all associated data.</div>
                  </div>
                  <button className="cs-btn-danger" disabled title="Coming soon">
                    Delete account
                  </button>
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
