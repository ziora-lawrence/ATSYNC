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
  const [dismissedIds, setDismissedIds] = useState([]);

  useEffect(() => {
    if (!agencyId) {
      setSubmissionsLoading(false);
      return;
    }

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

  const handleCopyInviteLink = (submissionId, clientName) => {
    const inviteLink = `${window.location.origin}/client/signup?intake=${submissionId}`;
    navigator.clipboard.writeText(inviteLink);
    triggerToast(`Invite link for ${clientName} copied!`);
  };

  const activeClients = clients.filter(c => c.type === 'active');
  const visibleSupabaseSubmissions = pendingSubmissions.filter(c => !dismissedIds.includes(c.id));
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

      setPendingSubmissions(prev =>
        prev.map(c => (c.id === client.id ? { ...c, status: 'approved', type: 'active' } : c))
      );

      // Auto-send invite email via backend
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await fetch(`${backendUrl}/api/auth/invite-client`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intakeId: client.id, agencyId }),
        });
        if (res.ok) {
          triggerToast(`${client.name} approved! Invite email sent automatically.`);
        } else {
          triggerToast(`${client.name} approved! Email failed — use Copy Invite Link instead.`);
        }
      } catch (err) {
        console.error('Invite email error:', err);
        triggerToast(`${client.name} approved! Email failed — use Copy Invite Link instead.`);
      }
      return;
    }

    // --- Static context fallback logic ---
    setClients(prev => prev.map(c =>
      c.id !== client.id ? c : { ...c, type: 'active' }
    ));
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

      setPendingSubmissions(prev =>
        prev.map(c => (c.id === client.id ? { ...c, status: 'rejected', type: 'rejected' } : c))
      );
      triggerToast(`${client.name} submission rejected.`);
    }
  };

  const handleRemoveFromView = (id) => {
    setDismissedIds(prev => [...prev, id]);
    triggerToast('Submission removed from view');
  };

  const handleSendToMarket = (leadName) => {
    triggerToast(`Lead "${leadName}" sent to the ATSYNC Marketplace!`);
  };

  const allScopeLogs = clients.reduce((acc, c) => {
    if (c.scopeCreepLog) {
      c.scopeCreepLog.forEach(log => acc.push({ clientName: c.name, ...log }));
    }
    return acc;
  }, []);

  return (
    <div className="view" id="view-intake">
      <div className="sec-header" style={{ marginBottom: '16px' }}>
        <div>
          <div className="sec-title">Your intake link</div>
          <div style={{ fontSize: '12px', color: 'var(--text-sec)', marginTop: '4px' }}>
            Share this link with potential clients
          </div>
        </div>
      </div>

      {agencyId ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-sub)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', marginBottom: '24px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-sec)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {intakeLink}
          </span>
          <button className="row-btn" onClick={handleCopyLink}>
            <i className="ti ti-copy"></i> Copy
          </button>
        </div>
      ) : (
        <div style={{ fontSize: '12px', color: 'var(--text-sec)', marginBottom: '24px', padding: '10px 14px', background: 'var(--bg-sub)', border: '1px solid var(--border)', borderRadius: '8px' }}>
          Log in to generate your intake link
        </div>
      )}

      <div className="metrics-grid">
        <div className="mc accent"><div className="mc-label">Links sent</div><div className="mc-val">8</div><div className="mc-sub">Active links</div></div>
        <div className="mc"><div className="mc-label">Submitted</div><div className="mc-val">{pendingSubmissions.length}</div><div className="mc-sub">Total intake submissions</div></div>
        <div className="mc"><div className="mc-label">Converted</div><div className="mc-val">{activeClients.length}</div><div className="mc-sub">From intake links</div></div>
      </div>

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
              const isApprovedIntake = c.status === 'approved' && c.source === 'supabase';
              const isRealActiveClient = c.type === 'active' && c.source !== 'supabase';
              const isRejected = c.status === 'rejected';

              return (
                <div key={c.id} className="alert-row">
                  <div className="alert-info">
                    <div className="alert-company">{c.name}</div>
                    <div className="alert-desc">{c.service} · {c.budget} · {c.deadline}</div>
                    {c.description && <div className="alert-desc" style={{ marginTop: '4px', opacity: 0.8 }}>{c.description}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`alert-badge ${isRealActiveClient || isApprovedIntake ? 'ready' : isRejected ? 'overdue' : 'pending'}`}>
                      {isRealActiveClient ? 'Active Client' : isApprovedIntake ? 'Approved' : isRejected ? 'Rejected' : 'Pending'}
                    </span>
                    
                    {isPending && (
                      <>
                        <button className="row-btn" onClick={() => handleApprove(c)} type="button">Approve</button>
                        <button className="row-btn" style={{ borderColor: 'rgba(255, 78, 78, 0.4)', color: 'var(--accent-red)' }} onClick={() => handleReject(c)} type="button">Reject</button>
                      </>
                    )}

                    {isApprovedIntake && (
                      <button className="row-btn" onClick={() => handleCopyInviteLink(c.id, c.name)} type="button">
                        Copy Invite Link
                      </button>
                    )}

                    {isRealActiveClient && (
                      <button className="row-btn" onClick={() => { setActiveClientId(c.id); navigate('/dashboard/clients'); }} type="button">
                        View Chat
                      </button>
                    )}

                    {isRejected && (
                      <button className="row-btn" onClick={() => handleRemoveFromView(c.id)} type="button">Remove</button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          <div className="alert-row">
            <div className="alert-info">
              <div className="alert-company">Chukwu Foods (Lead)</div>
              <div className="alert-desc">Web Design · ₦100k · Low budget auto-flagged</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="alert-badge overdue">Low Budget</span>
              <button className="row-btn" onClick={() => handleSendToMarket('Chukwu Foods')} type="button">Send to market</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntakeLinks;