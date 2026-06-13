import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const IntakeLinks = () => {
  const navigate = useNavigate();
  const {
    clients = [],
    setClients,
    loading,
    triggerToast,
    setNotificationsList,
    setActiveClientId,
  } = useOutletContext();

  const user = JSON.parse(localStorage.getItem("atsync_user") || "{}");
  const agencyId = user.agencyId;
  const intakeLink = `${window.location.origin}/intake/${agencyId}`;

  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  // Track locally dismissed/removed row IDs
  const [dismissedIds, setDismissedIds] = useState([]);

  // Fetch real pending intake submissions for this agency
  useEffect(() => {
    if (!agencyId) {
      setSubmissionsLoading(false);
      return;
    }

  document.title = "ATSync | Intake Links";
    let isMounted = true;

    const fetchSubmissions = async () => {
      setSubmissionsLoading(true);
      const { data, error } = await supabase
        .from('intake_submissions')
        .select('*')
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error('Error fetching intake submissions:', error);
        setPendingSubmissions([]);
      } else {
        // Shape Supabase rows to match what this component expects
        const shaped = (data || []).map((row) => ({
          id: row.id,
          type: row.status === 'approved' ? 'active' : row.status === 'rejected' ? 'rejected' : 'pending',
          name: row.business_name || row.name,
          contactName: row.name,
          email: row.email,
          service: row.service_needed,
          description: row.description,
          budget: row.budget || 'Not specified',
          deadline: row.deadline || 'Not specified',
          status: row.status,
          source: 'supabase',
        }));
        setPendingSubmissions(shaped);
      }
      setSubmissionsLoading(false);
    };

    fetchSubmissions();

    return () => {
      isMounted = false;
    };
  }, [agencyId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(intakeLink);
    triggerToast('Intake link copied to clipboard');
  };

  // Mocked active clients (kept until real approval flow creates real clients)
  const activeClients = clients.filter(c => c.type === 'active');

  // Filter out any submissions that the agency chose to hide/remove locally
  const visibleSupabaseSubmissions = pendingSubmissions.filter(c => !dismissedIds.includes(c.id));

  // Combined list displays everything loaded from Supabase alongside static active states
  const combinedList = [...visibleSupabaseSubmissions, ...activeClients];

  const handleApprove = async (client) => {
    if (client.source === 'supabase') {
      const { error } = await supabase
        .from('intake_submissions')
        .update({ status: 'approved' })
        .eq('id', client.id);

      if (error) {
        console.error('Error approving submission:', error);
        triggerToast('Failed to approve — try again');
        return;
      }

      // Update state so it toggles to 'approved' / 'active' inline without vanishing
      setPendingSubmissions(prev =>
        prev.map(c => (c.id === client.id ? { ...c, status: 'approved', type: 'active' } : c))
      );

      triggerToast(`${client.name} approved! Account invite pending.`);
      setNotificationsList(prev => [
        { id: Date.now(), text: `${client.name} approved from intake.`, read: false },
        ...prev
      ]);
      return;
    }

    // --- Existing mocked-client approval logic ---
    setClients(prev => prev.map(c =>
      c.id !== client.id ? c : {
        ...c,
        type: 'active',
        statusDot: 'green',
        alertBadge: 'ready',
        alertDesc: 'Brief approved – phase 2 ready',
        progress: 25,
        sentiment: 90,
        sentimentLabel: 'Great',
        sentimentColor: 'green',
        priorityAction: 'Setup kickoff meeting with product owner.',
        tasks: [
          { id: 1, text: 'Confirm project scope & details', completed: false, hours: 2, remaining: 2, overdue: false },
          { id: 2, text: 'Establish Slack / Communication group', completed: false, hours: 1, remaining: 1, overdue: false }
        ],
        timeline: [
          { id: 1, date: 'Pending', title: 'Phase 1 — Onboarding', status: 'Active', progress: 50, active: true }
        ],
        chatLog: [
          {
            id: Date.now(),
            sender: 'bob',
            senderName: 'BOB AI',
            avatarInitials: 'B',
            text: `Welcome onboard ${client.name}! Let's start by reviewing the project specifications.`,
            time: 'Just now'
          }
        ]
      }
    ));

    triggerToast(`${client.name} moved to Active Roster!`);
    setNotificationsList(prev => [
      { id: Date.now(), text: `${client.name} is now onboarded to Active Roster.`, read: false },
      ...prev
    ]);

    setActiveClientId(client.id);
    navigate('/dashboard/clients');
  };

  const handleReject = async (client) => {
    if (client.source === 'supabase') {
      const { error } = await supabase
        .from('intake_submissions')
        .update({ status: 'rejected' })
        .eq('id', client.id);

      if (error) {
        console.error('Error rejecting submission:', error);
        triggerToast('Failed to reject — try again');
        return;
      }

      // Flip status locally to keep it in the list with rejected attributes
      setPendingSubmissions(prev =>
        prev.map(c => (c.id === client.id ? { ...c, status: 'rejected', type: 'rejected' } : c))
      );

      triggerToast(`${client.name} submission rejected.`);
      setNotificationsList(prev => [
        { id: Date.now(), text: `${client.name} intake submission was rejected.`, read: false },
        ...prev
      ]);
    }
  };

  const handleRemoveFromView = (id) => {
    setDismissedIds(prev => [...prev, id]);
    triggerToast('Submission removed from dashboard view');
  };

  const handleSendToMarket = (leadName) => {
    triggerToast(`Lead "${leadName}" sent to the ATSYNC Marketplace!`);
    setNotificationsList(prev => [
      { id: Date.now(), text: `Lead "${leadName}" listed on the Agency Marketplace.`, read: false },
      ...prev
    ]);
  };

  const allScopeLogs = clients.reduce((acc, c) => {
    if (c.scopeCreepLog && c.scopeCreepLog.length > 0) {
      c.scopeCreepLog.forEach(log => {
        acc.push({
          clientId: c.id,
          clientName: c.name,
          ...log
        });
      });
    }
    return acc;
  }, []);

  return (
    <div className="view" id="view-intake">

      {/* Intake link section */}
      <div className="sec-header" style={{ marginBottom: '16px' }}>
        <div>
          <div className="sec-title">Your intake link</div>
          <div style={{ fontSize: '12px', color: 'var(--text-sec)', marginTop: '4px' }}>
            Share this link with potential clients
          </div>
        </div>
      </div>

      {agencyId ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-sub)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '24px'
        }}>
          <span style={{
            fontSize: '12px',
            color: 'var(--text-sec)',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {intakeLink}
          </span>
          <button className="row-btn" onClick={handleCopyLink}>
            <i className="ti ti-copy"></i> Copy
          </button>
        </div>
      ) : (
        <div style={{
          fontSize: '12px',
          color: 'var(--text-sec)',
          marginBottom: '24px',
          padding: '10px 14px',
          background: 'var(--bg-sub)',
          border: '1px solid var(--border)',
          borderRadius: '8px'
        }}>
          Log in to generate your intake link
        </div>
      )}

      {/* Stats cards */}
      <div className="metrics-grid">
        <div className="mc accent">
          <div className="mc-label">Links sent</div>
          <div className="mc-val">8</div>
          <div className="mc-sub">Active links</div>
        </div>
        <div className="mc">
          <div className="mc-label">Submitted</div>
          <div className="mc-val">{pendingSubmissions.length}</div>
          <div className="mc-sub">Total intake submissions</div>
        </div>
        <div className="mc">
          <div className="mc-label">Converted</div>
          <div className="mc-val">{activeClients.length}</div>
          <div className="mc-sub">From intake links</div>
        </div>
      </div>

      {/* Recent submissions list */}
      <div style={{ marginTop: '10px' }}>
        <div className="sec-header">
          <div className="sec-title">Recent submissions</div>
        </div>
        <div className="alerts-list">
          {submissionsLoading ? (
            <div style={{ fontSize: '11px', color: 'var(--text-sec)' }}>Loading submissions...</div>
          ) : combinedList.length === 0 ? (
            <div style={{ fontSize: '11px', color: 'var(--text-sec)' }}>No submissions yet</div>
          ) : (
            combinedList.map((c) => {
              const isPending = c.status === 'pending';
              const isActive = c.status === 'approved' || c.type === 'active';
              const isRejected = c.status === 'rejected';

              return (
                <div key={c.id} className="alert-row">
                  <div className="alert-info">
                    <div className="alert-company">{c.name}</div>
                    <div className="alert-desc">{c.service} · {c.budget} · {c.deadline}</div>
                    {c.description && (
                      <div className="alert-desc" style={{ marginTop: '4px', opacity: 0.8 }}>
                        {c.description}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`alert-badge ${isActive ? 'ready' : isRejected ? 'overdue' : 'pending'}`}>
                      {isActive ? 'Active' : isRejected ? 'Rejected' : 'Pending'}
                    </span>
                    
                    {/* Actions for Pending Submissions */}
                    {isPending && (
                      <>
                        <button
                          className="row-btn"
                          onClick={() => handleApprove(c)}
                          type="button"
                        >
                          Approve
                        </button>
                        <button
                          className="row-btn"
                          style={{ borderColor: 'rgba(255, 78, 78, 0.4)', color: 'var(--accent-red)' }}
                          onClick={() => handleReject(c)}
                          type="button"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* Actions for Approved/Active Submissions */}
                    {isActive && (
                      <button
                        className="row-btn"
                        onClick={() => {
                          if (c.source !== 'supabase') {
                            setActiveClientId(c.id);
                          }
                          navigate('/dashboard/clients');
                        }}
                        type="button"
                      >
                        View Chat
                      </button>
                    )}

                    {/* Actions for Rejected Submissions */}
                    {isRejected && (
                      <button
                        className="row-btn"
                        onClick={() => handleRemoveFromView(c.id)}
                        type="button"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Anon rejected lead (Chukwu Foods Hardcoded Row) */}
          <div className="alert-row">
            <div className="alert-info">
              <div className="alert-company">Chukwu Foods (Lead)</div>
              <div className="alert-desc">Web Design · ₦100k · Low budget auto-flagged</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="alert-badge overdue">Low Budget</span>
              <button
                className="row-btn"
                onClick={() => handleSendToMarket('Chukwu Foods')}
                type="button"
              >
                Send to market
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scope creep logs */}
      <div style={{ marginTop: '20px' }}>
        <div className="sec-header">
          <div className="sec-title">Scope creep log</div>
        </div>
        <div className="alerts-list">
          {loading ? (
            <div style={{ fontSize: '11px', color: 'var(--text-sec)' }}>Loading logs...</div>
          ) : allScopeLogs.length === 0 ? (
            <div style={{ fontSize: '11px', color: 'var(--text-sec)' }}>No scope creep flags reported</div>
          ) : (
            allScopeLogs.map((log, index) => {
              const isResolved = log.status === 'Resolved';
              return (
                <div key={index} className="alert-row">
                  <div className="alert-info">
                    <div className="alert-company">{log.clientName}</div>
                    <div className="alert-desc">{log.desc}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-sec)' }}>
                      {log.date}
                    </span>
                    <span className={`alert-badge ${isResolved ? 'ready' : 'urgent'}`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};

export default IntakeLinks;