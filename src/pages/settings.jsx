import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

/**
 * Settings page – displays Team list, invite code, and account billing information.
 * Follows the visual mockup layout and styling.
 */
export const Settings = () => {
  const { triggerToast, clients = [] } = useOutletContext();
  const [copyStatus, setCopyStatus] = useState('Copy');

  const activeClientsCount = clients.filter(c => c.type === 'active').length;
  const pendingClientsCount = clients.filter(c => c.type === 'pending').length;
  const totalClientsUsed = activeClientsCount + pendingClientsCount;

  const handleCopyCode = () => {
    navigator.clipboard.writeText('atsync-team-x9k2-zw4r');
    setCopyStatus('Copied ✓');
    triggerToast('Team invite code copied to clipboard!');
    setTimeout(() => {
      setCopyStatus('Copy');
    }, 2000);
  };

  return (
    <div className="view" id="view-settings" style={{ height: '100%' }}>
      <div className="chat-header">
        <div>
          <h2>Settings</h2>
          <div className="chat-sub">Team and account settings</div>
        </div>
      </div>

      <div className="page-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Team Card */}
        <div style={{ background: '#0a1828', border: '0.5px solid #1e2a38', borderRadius: '8px', padding: '14px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <i className="ti ti-users" style={{ color: 'var(--cyan)' }}></i> Team
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', padding: '7px 0', borderBottom: '0.5px solid #141c27', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Owner</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Daniel Iwuji</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', padding: '7px 0', borderBottom: '0.5px solid #141c27', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Co-founder 1</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Dev · Joined Jun 1</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', padding: '7px 0', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Co-founder 2</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Content · Joined Jun 1</span>
          </div>

          <div style={{ background: '#141c27', border: '0.5px solid #1e2a38', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
            <span>atsync-team-x9k2-zw4r</span>
            <button
              onClick={handleCopyCode}
              style={{
                background: 'transparent',
                border: 'none',
                color: copyStatus === 'Copied ✓' ? 'var(--green)' : 'var(--cyan)',
                cursor: 'pointer',
                fontSize: '10px',
                fontFamily: 'inherit',
                fontWeight: 'bold',
              }}
              type="button"
            >
              {copyStatus}
            </button>
          </div>
        </div>

        {/* Billing Card */}
        <div style={{ background: '#0a1828', border: '0.5px solid #1e2a38', borderRadius: '8px', padding: '14px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <i className="ti ti-credit-card" style={{ color: 'var(--cyan)' }}></i> Billing
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', padding: '7px 0', borderBottom: '0.5px solid #141c27', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Current plan</span>
            <span className="alert-badge ready" style={{ fontSize: '9px', padding: '2px 6px', display: 'inline-block', lineHeight: 1 }}>
              Growth — $15/mo
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', padding: '7px 0', borderBottom: '0.5px solid #141c27', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Transaction cut</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>1% per transaction</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', padding: '7px 0', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Client slots</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{totalClientsUsed} of 15 used</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
