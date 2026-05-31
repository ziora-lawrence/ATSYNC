import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

/**
 * Marketplace page – Coming Soon screen for the Agency Marketplace.
 * Provides a high-fidelity visual layout for lead re-routing and matcher features.
 */
export const Marketplace = () => {
  const { triggerToast } = useOutletContext();
  const [notified, setNotified] = useState(false);

  const handleNotifyClick = () => {
    if (notified) return;
    setNotified(true);
    triggerToast('Subscribed to Marketplace launch updates!');
  };

  return (
    <div className="view" id="view-marketplace" style={{ height: '100%' }}>
      <div className="chat-header">
        <div>
          <h2>Marketplace</h2>
          <div className="chat-sub">Move leads between agencies — coming in V1</div>
        </div>
      </div>

      <div className="cs-page">
        {/* Blurred skeleton background representation */}
        <div className="cs-skeleton">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
            <div className="skel" style={{ height: '55px', borderRadius: '8px' }}></div>
            <div className="skel" style={{ height: '55px', borderRadius: '8px' }}></div>
            <div className="skel" style={{ height: '55px', borderRadius: '8px' }}></div>
            <div className="skel" style={{ height: '55px', borderRadius: '8px' }}></div>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            <div className="skel" style={{ height: '26px', width: '80px', borderRadius: '6px' }}></div>
            <div className="skel" style={{ height: '26px', width: '100px', borderRadius: '6px' }}></div>
            <div className="skel" style={{ height: '26px', width: '90px', borderRadius: '6px' }}></div>
          </div>
          <div className="skel" style={{ height: '60px', borderRadius: '8px', marginTop: '6px' }}></div>
          <div className="skel" style={{ height: '60px', borderRadius: '8px' }}></div>
          <div className="skel" style={{ height: '60px', borderRadius: '8px' }}></div>
        </div>

        {/* Dynamic content overlay */}
        <div className="cs-overlay">
          <span className="cs-badge">COMING IN V1</span>
          <div className="cs-title">The Agency Marketplace</div>
          <div className="cs-desc">
            Rejected a lead? List it. Another ATSYNC agency claims it, pays a finder's fee, client gets matched. Nobody loses a lead again.
          </div>
          <div className="cs-features">
            <div className="cs-feat">
              <i className="ti ti-arrows-exchange"></i>
              <span>Reroute rejected leads to other agencies</span>
            </div>
            <div className="cs-feat">
              <i className="ti ti-cash"></i>
              <span>Earn a finder's fee on every lead you sell</span>
            </div>
            <div className="cs-feat">
              <i className="ti ti-user-check"></i>
              <span>Clients matched and notified seamlessly</span>
            </div>
            <div className="cs-feat">
              <i className="ti ti-building-store"></i>
              <span>Public agency profiles — coming in V2</span>
            </div>
          </div>
          <button
            className="cs-notify"
            onClick={handleNotifyClick}
            style={{
              borderColor: notified ? 'var(--green)' : 'var(--cyan)',
              color: notified ? 'var(--green)' : 'var(--cyan)',
              cursor: notified ? 'default' : 'pointer',
            }}
            type="button"
          >
            <i className={`ti ${notified ? 'ti-check' : 'ti-bell'}`} style={{ fontSize: '12px' }}></i>{' '}
            {notified ? 'Subscribed ✓' : 'Notify me when it\'s live'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
