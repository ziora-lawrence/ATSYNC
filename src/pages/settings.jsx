import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import './dashboard.css';

const Settings = () => {
  const { clients, triggerToast } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [inviteCopied, setInviteCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const activeClientsCount = clients.filter(c => c.type === 'active').length;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText("atsync-team-x9k2-zw4r");
    setInviteCopied(true);
    triggerToast("Invite token copied to clipboard!");
    setTimeout(() => setInviteCopied(false), 2000);
  };

  return (
    <div className="db-middle-panel" style={{ height: '100%', overflowY: 'auto' }}>
      <section className="db-header">
        <h1>Settings</h1>
        <p>Team and account configurations</p>
      </section>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="db-skeleton" style={{ height: '140px', borderRadius: '8px' }}></div>
          <div className="db-skeleton" style={{ height: '120px', borderRadius: '8px' }}></div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Team configuration card */}
          <div style={{ background: 'var(--panel-bg)', border: '0.5px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-users" style={{ color: 'var(--cyan)' }}></i> Team Management
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #131920', fontSize: '0.72rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Owner</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Daniel Iwuji</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #131920', fontSize: '0.72rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Co-founder 1</span>
              <span style={{ color: 'var(--text-primary)' }}>Dev · Joined Jun 1</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.72rem', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Co-founder 2</span>
              <span style={{ color: 'var(--text-primary)' }}>Content · Joined Jun 1</span>
            </div>

            {/* Team token invite copy */}
            <div style={{ background: '#111721', border: '0.5px solid var(--border-color)', borderRadius: '6px', padding: '10px 14px', fontSize: '0.72rem', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>atsync-team-x9k2-zw4r</span>
              <button className="copy-btn" onClick={handleCopyInvite} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--cyan)', fontWeight: 'bold' }}>
                {inviteCopied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Billing subscription card */}
          <div style={{ background: 'var(--panel-bg)', border: '0.5px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-credit-card" style={{ color: 'var(--cyan)' }}></i> Billing & Tiers
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #131920', fontSize: '0.72rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Current Plan</span>
              <span className="badge bg" style={{ fontSize: '8px' }}>Growth — $15/mo</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #131920', fontSize: '0.72rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Transaction cut</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>1% per transaction payout</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.72rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Client slots used</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{activeClientsCount} of 15 slots used</span>
            </div>
          </div>

          {/* Pricing tier list */}
          <div style={{ background: 'var(--panel-bg)', border: '0.5px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-chart-bar" style={{ color: 'var(--cyan)' }}></i> Available Subscriptions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', opacity: 0.6 }}>
                <span>Free Tier</span>
                <span>3 slots max</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--cyan)', fontWeight: 'bold' }}>
                <span>Growth Plan</span>
                <span>15 slots max · $15/mo</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', opacity: 0.6 }}>
                <span>Agency Plan</span>
                <span>Unlimited slots · $35/mo</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
