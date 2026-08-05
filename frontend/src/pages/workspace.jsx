// frontend/src/pages/workspace.jsx
// Team Member read-only workspace view.
// On mount:
//  1. Reads the agencyId from route params.
//  2. Confirms the logged-in user has a staff row for that agency.
//  3. Calls POST /api/auth/activate-staff (service-role) to flip status → active.
//  4. Loads agency_clients for display.

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/api';
import './workspace.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'https://atsync-backend-vdko.onrender.com';

// ── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name = '') =>
  name.split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || '??';

// ── Component ─────────────────────────────────────────────────────────────────
const Workspace = () => {
  const { agencyId } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState('loading'); // loading | error | ready
  const [errorMsg, setErrorMsg] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [staffRecord, setStaffRecord] = useState(null);
  const [agencyName, setAgencyName] = useState('');
  const [clients, setClients] = useState([]);

  // ── Boot: verify session → verify staff membership → activate → load clients
  const boot = useCallback(async () => {
    setState('loading');

    // 1. Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/');
      return;
    }
    setCurrentUser(session.user);

    // 2. Confirm this user has a staff row for this agencyId
    const { data: staffRow, error: staffErr } = await supabase
      .from('staff')
      .select('id, role, status, email')
      .eq('agency_id', agencyId)
      .eq('email', session.user.email.toLowerCase())
      .maybeSingle();

    if (staffErr || !staffRow) {
      setErrorMsg('You are not a member of this agency. Contact the agency owner.');
      setState('error');
      return;
    }
    setStaffRecord(staffRow);

    // 3. Activate server-side (service-role) if still 'invited'
    if (staffRow.status === 'invited') {
      try {
        await fetch(`${BACKEND}/api/auth/activate-staff`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ agencyId }),
        });
        // Update local copy optimistically — verification isn't blocking UX
      } catch (e) {
        console.warn('activate-staff call failed:', e);
      }
    }

    // 4. Load agency profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_name')
      .eq('id', agencyId)
      .maybeSingle();
    setAgencyName(profile?.agency_name || 'Agency');

    // 5. Load clients linked to this agency (agency_clients)
    const { data: clientRows } = await supabase
      .from('agency_clients')
      .select('id, business_name, service, status, created_at')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });

    setClients(clientRows || []);
    setState('ready');
  }, [agencyId, navigate]);

  useEffect(() => { boot(); }, [boot]);

  // ── Sign out ──────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const activeCount = clients.filter(c => c.status === 'active').length;
  const pendingCount = clients.filter(c => c.status === 'pending').length;
  const totalCount = clients.length;

  // ── Render states ─────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div className="ws-center">
        <div className="ws-spinner" />
        <span>Loading workspace…</span>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="ws-center">
        <div className="ws-error-box">{errorMsg}</div>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '12px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.13)',
            color: '#A98BFF',
            borderRadius: '8px',
            padding: '8px 20px',
            fontFamily: 'inherit',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          ← Back to home
        </button>
      </div>
    );
  }

  const userEmail = currentUser?.email || '';
  const initials = getInitials(userEmail.split('@')[0]);
  const roleLabel = staffRecord?.role === 'viewer' ? 'Viewer' : 'Editor';

  return (
    <div className="ws-shell">
      {/* ── Header ── */}
      <header className="ws-header">
        <div className="ws-logo">
          ATS<span>YNC</span>
        </div>
        <div className="ws-header-right">
          <div className="ws-badge">
            <i className="ti ti-users" />
            Team Workspace
          </div>
          <div className="ws-user-chip">
            <div className="ws-avatar">{initials}</div>
            <span>{userEmail}</span>
          </div>
          <button className="ws-sign-out" onClick={handleSignOut}>
            <i className="ti ti-logout" /> Sign out
          </button>
        </div>
      </header>

      {/* ── Agency banner ── */}
      <div className="ws-agency-banner">
        <div className="ws-agency-icon">
          {getInitials(agencyName)}
        </div>
        <div className="ws-agency-info">
          <h2>{agencyName}</h2>
          <p>You're viewing this workspace as a <strong style={{ color: '#A98BFF' }}>{roleLabel}</strong> — read-only access.</p>
        </div>
      </div>

      {/* ── Main ── */}
      <main className="ws-main">
        {/* Stat bar */}
        <div className="ws-stats">
          <div className="ws-stat">
            <div className="ws-stat-label">Total Clients</div>
            <div className="ws-stat-value cyan">{totalCount}</div>
          </div>
          <div className="ws-stat">
            <div className="ws-stat-label">Active</div>
            <div className="ws-stat-value green">{activeCount}</div>
          </div>
          <div className="ws-stat">
            <div className="ws-stat-label">Pending</div>
            <div className="ws-stat-value amber">{pendingCount}</div>
          </div>
          <div className="ws-stat">
            <div className="ws-stat-label">Your Role</div>
            <div className="ws-stat-value purple" style={{ fontSize: '18px', paddingTop: '5px' }}>
              {roleLabel}
            </div>
          </div>
        </div>

        {/* Client list */}
        <div className="ws-section-header">
          <div className="ws-section-title">
            <i className="ti ti-users" />
            Client Roster
          </div>
          <span className="ws-read-only-chip">Read-only</span>
        </div>

        <div className="ws-client-list">
          {clients.length === 0 ? (
            <div className="ws-empty">
              <i className="ti ti-users-group" />
              No clients yet — the agency owner hasn't added any clients.
            </div>
          ) : (
            clients.map(client => {
              const dotClass =
                client.status === 'active' ? 'green' :
                client.status === 'pending' ? 'amber' : 'gray';
              const badgeClass =
                client.status === 'active' ? 'active' :
                client.status === 'pending' ? 'pending' : 'inactive';

              const joinedDate = client.created_at
                ? new Date(client.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—';

              return (
                <div key={client.id} className="ws-client-row">
                  <div className={`ws-client-dot ${dotClass}`} />
                  <div className="ws-client-info">
                    <div className="ws-client-name">{client.business_name || 'Unnamed Client'}</div>
                    <div className="ws-client-meta">
                      {client.service ? `${client.service} · ` : ''}Added {joinedDate}
                    </div>
                  </div>
                  <span className={`ws-client-badge ${badgeClass}`}>{client.status || 'unknown'}</span>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default Workspace;
